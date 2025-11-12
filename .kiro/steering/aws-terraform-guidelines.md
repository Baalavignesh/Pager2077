---
inclusion: fileMatch
fileMatchPattern: "backend/terraform/**/*.tf"
---

# AWS & Terraform Guidelines for Pager2077

This steering document is automatically included when working on Terraform infrastructure files.

## Infrastructure Overview

Pager2077 uses AWS serverless architecture:
- **API Gateway**: REST API endpoints
- **Lambda**: Bun runtime for API handlers
- **RDS PostgreSQL**: Relational database
- **S3**: Voice note storage (48-hour lifecycle)
- **SNS**: Push notifications

## Terraform Best Practices

### File Organization

```
backend/terraform/
├── main.tf           # Provider and backend config
├── variables.tf      # Input variables
├── outputs.tf        # Output values
├── api-gateway.tf    # API Gateway resources
├── lambda.tf         # Lambda functions
├── rds.tf           # Database resources
├── s3.tf            # S3 bucket and policies
├── sns.tf           # SNS topics and subscriptions
└── iam.tf           # IAM roles and policies
```

### Naming Conventions

```hcl
# Resource naming: project-environment-service-purpose
resource "aws_s3_bucket" "voice_notes" {
  bucket = "pager2077-${var.environment}-voice-notes"
}

# Use consistent prefixes
locals {
  name_prefix = "pager2077-${var.environment}"
}
```

### Tagging Strategy

```hcl
locals {
  common_tags = {
    Project     = "Pager2077"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_s3_bucket" "voice_notes" {
  bucket = "${local.name_prefix}-voice-notes"
  tags   = local.common_tags
}
```

## Lambda Configuration

### Bun Runtime

```hcl
resource "aws_lambda_function" "api_handler" {
  function_name = "${local.name_prefix}-api-handler"
  runtime       = "provided.al2"  # Custom runtime for Bun
  handler       = "index.handler"
  
  # Bun layer
  layers = [aws_lambda_layer_version.bun_runtime.arn]
  
  # Environment variables
  environment {
    variables = {
      NODE_ENV    = var.environment
      DB_HOST     = aws_db_instance.postgres.address
      DB_NAME     = var.db_name
      DB_USER     = var.db_user
      DB_PASSWORD = var.db_password  # Use Secrets Manager in production
      S3_BUCKET   = aws_s3_bucket.voice_notes.id
      JWT_SECRET  = var.jwt_secret   # Use Secrets Manager in production
    }
  }
  
  # Timeout and memory
  timeout     = 30
  memory_size = 512
  
  # VPC config for RDS access
  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }
  
  tags = local.common_tags
}
```

### Lambda Layer for Bun

```hcl
resource "aws_lambda_layer_version" "bun_runtime" {
  filename            = "bun-runtime-layer.zip"
  layer_name          = "${local.name_prefix}-bun-runtime"
  compatible_runtimes = ["provided.al2"]
  
  description = "Bun JavaScript runtime for Lambda"
}
```

## API Gateway Configuration

### REST API

```hcl
resource "aws_api_gateway_rest_api" "main" {
  name        = "${local.name_prefix}-api"
  description = "Pager2077 REST API"
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }
  
  tags = local.common_tags
}

# CORS configuration
resource "aws_api_gateway_method" "options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = aws_api_gateway_method.options.http_method
  type        = "MOCK"
  
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}
```

### JWT Authorizer

```hcl
resource "aws_api_gateway_authorizer" "jwt" {
  name                   = "${local.name_prefix}-jwt-authorizer"
  rest_api_id           = aws_api_gateway_rest_api.main.id
  type                  = "TOKEN"
  authorizer_uri        = aws_lambda_function.authorizer.invoke_arn
  authorizer_credentials = aws_iam_role.authorizer.arn
  identity_source       = "method.request.header.Authorization"
}
```

## RDS PostgreSQL Configuration

### Database Instance

```hcl
resource "aws_db_instance" "postgres" {
  identifier     = "${local.name_prefix}-db"
  engine         = "postgres"
  engine_version = "15.4"
  
  instance_class    = "db.t3.micro"  # Adjust for production
  allocated_storage = 20
  storage_type      = "gp3"
  
  db_name  = var.db_name
  username = var.db_user
  password = var.db_password  # Use Secrets Manager
  
  # Networking
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  
  # Backup
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"
  
  # Deletion protection
  deletion_protection = var.environment == "production"
  skip_final_snapshot = var.environment != "production"
  
  tags = local.common_tags
}

# Subnet group
resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-db-subnet"
  subnet_ids = aws_subnet.private[*].id
  
  tags = local.common_tags
}
```

### Security Group

```hcl
resource "aws_security_group" "rds" {
  name        = "${local.name_prefix}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description     = "PostgreSQL from Lambda"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }
  
  tags = local.common_tags
}
```

## S3 Configuration

### Voice Notes Bucket

```hcl
resource "aws_s3_bucket" "voice_notes" {
  bucket = "${local.name_prefix}-voice-notes"
  
  tags = local.common_tags
}

# Block public access
resource "aws_s3_bucket_public_access_block" "voice_notes" {
  bucket = aws_s3_bucket.voice_notes.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle policy - delete after 48 hours
resource "aws_s3_bucket_lifecycle_configuration" "voice_notes" {
  bucket = aws_s3_bucket.voice_notes.id
  
  rule {
    id     = "delete-old-voice-notes"
    status = "Enabled"
    
    expiration {
      days = 2  # 48 hours
    }
  }
}

# Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "voice_notes" {
  bucket = aws_s3_bucket.voice_notes.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Versioning (optional)
resource "aws_s3_bucket_versioning" "voice_notes" {
  bucket = aws_s3_bucket.voice_notes.id
  
  versioning_configuration {
    status = "Disabled"  # Not needed for temporary files
  }
}
```

### CORS Configuration

```hcl
resource "aws_s3_bucket_cors_configuration" "voice_notes" {
  bucket = aws_s3_bucket.voice_notes.id
  
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET"]
    allowed_origins = ["*"]  # Restrict in production
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
```

## SNS Configuration

### Platform Applications

```hcl
# iOS APNS
resource "aws_sns_platform_application" "ios" {
  name     = "${local.name_prefix}-ios-push"
  platform = "APNS"
  
  platform_credential = var.apns_certificate  # P12 certificate
  platform_principal  = var.apns_private_key
  
  # Use APNS_SANDBOX for development
  # Use APNS for production
}

# Android FCM
resource "aws_sns_platform_application" "android" {
  name     = "${local.name_prefix}-android-push"
  platform = "GCM"  # Firebase Cloud Messaging
  
  platform_credential = var.fcm_server_key
}
```

## IAM Roles and Policies

### Lambda Execution Role

```hcl
resource "aws_iam_role" "lambda_exec" {
  name = "${local.name_prefix}-lambda-exec"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
  
  tags = local.common_tags
}

# Attach policies
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Custom policy for S3 and SNS
resource "aws_iam_role_policy" "lambda_custom" {
  name = "${local.name_prefix}-lambda-policy"
  role = aws_iam_role.lambda_exec.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.voice_notes.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = "*"
      }
    ]
  })
}
```

## VPC Configuration

### VPC and Subnets

```hcl
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-vpc"
  })
}

# Private subnets for Lambda and RDS
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-private-${count.index + 1}"
  })
}

# Public subnets for NAT Gateway
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 101}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-public-${count.index + 1}"
  })
}
```

## Variables and Outputs

### Variables

```hcl
variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "pager2077"
}

variable "db_user" {
  description = "Database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}
```

### Outputs

```hcl
output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = aws_api_gateway_deployment.main.invoke_url
}

output "s3_bucket_name" {
  description = "S3 bucket name for voice notes"
  value       = aws_s3_bucket.voice_notes.id
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.postgres.endpoint
  sensitive   = true
}

output "lambda_function_names" {
  description = "Lambda function names"
  value       = {
    api_handler = aws_lambda_function.api_handler.function_name
  }
}
```

## Security Best Practices

### Secrets Management

```hcl
# Use AWS Secrets Manager for sensitive values
resource "aws_secretsmanager_secret" "db_password" {
  name = "${local.name_prefix}-db-password"
  
  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}

# Lambda can retrieve from Secrets Manager
# Add IAM permission for secretsmanager:GetSecretValue
```

### Least Privilege IAM

- Grant only necessary permissions
- Use resource-specific ARNs (not `*`)
- Separate roles for different functions
- Enable MFA for sensitive operations

### Network Security

- Use private subnets for Lambda and RDS
- Restrict security group rules
- Enable VPC Flow Logs
- Use NAT Gateway for outbound traffic

## Cost Optimization

### Lambda
- Right-size memory allocation
- Use provisioned concurrency sparingly
- Set appropriate timeout values
- Monitor invocation metrics

### RDS
- Use appropriate instance size
- Enable auto-scaling storage
- Use read replicas only if needed
- Consider Aurora Serverless for variable load

### S3
- Lifecycle policies for automatic deletion
- Use S3 Intelligent-Tiering if needed
- Monitor storage metrics

## Deployment Workflow

### Initialize Terraform

```bash
cd backend/terraform
terraform init
```

### Plan Changes

```bash
terraform plan -var-file="dev.tfvars"
```

### Apply Changes

```bash
terraform apply -var-file="dev.tfvars"
```

### Destroy Resources

```bash
terraform destroy -var-file="dev.tfvars"
```

## Environment-Specific Configurations

### dev.tfvars
```hcl
environment = "dev"
aws_region  = "us-east-1"
db_name     = "pager2077_dev"
# Other variables...
```

### production.tfvars
```hcl
environment = "production"
aws_region  = "us-east-1"
db_name     = "pager2077"
# Enable deletion protection
# Use larger instance sizes
# Enable multi-AZ
```

## Monitoring and Logging

### CloudWatch Logs

```hcl
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.api_handler.function_name}"
  retention_in_days = 7  # Adjust for production
  
  tags = local.common_tags
}
```

### CloudWatch Alarms

```hcl
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${local.name_prefix}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "Lambda function errors"
  
  dimensions = {
    FunctionName = aws_lambda_function.api_handler.function_name
  }
}
```

## Troubleshooting

### Common Issues

**Lambda can't connect to RDS**
- Check security group rules
- Verify Lambda is in VPC
- Check subnet routing

**S3 presigned URLs not working**
- Verify CORS configuration
- Check IAM permissions
- Verify URL expiration

**API Gateway 502 errors**
- Check Lambda timeout
- Verify Lambda execution role
- Check CloudWatch logs

## References

- [AWS Lambda with Bun](https://bun.sh/guides/runtime/aws-lambda)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

## When in Doubt

- Follow AWS best practices
- Use least privilege IAM
- Enable encryption at rest
- Tag all resources
- Use Secrets Manager for sensitive data
- Test in dev environment first
- Monitor costs and usage
