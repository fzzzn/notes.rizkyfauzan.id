---
title: AWS Lambda Compress Image from S3 and Log into DynamoDB
date: 2026-03-17
---

## Overview
In this note, we will explore how to use AWS Lambda to compress images stored in Amazon S3 and log the details of the operation into DynamoDB. This is a common use case for optimizing storage and improving performance when serving images.

## Prerequisites
1. S3 Bucket: You need two S3 buckets - one for the source images (e.g., `source-bucket`) and another for the compressed images (e.g., `destination-bucket`).
2. DynamoDB Table: Create a DynamoDB table (e.g., `ImageLogs`) with a Partition Key named `ImageID` (String).
3. Lambda Layer: Since the standard Python environment in Lambda does not include image processing libraries, you will need to add the Pillow (PIL) library through a Lambda Layer.

## AWS Lambda Function (Python)
Here is an example code using boto3 and Pillow:

```python
import boto3
import os
import uuid
from datetime import datetime
from PIL import Image
import io

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ImageLogs')

def lambda_handler(event, context):
    # 1. Get information about the uploaded image from the event
    bucket_name = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    # Choose the target bucket (can be the same or different)
    target_bucket = "destination-bucket"
    download_path = '/tmp/{}'.format(key)
    upload_path = 'compressed-{}'.format(key)
    
    # 2. Download image from S3 to temporary storage (/tmp)
    s3.download_file(bucket_name, key, download_path)
    
    # 3. Process compression using Pillow
    with Image.open(download_path) as img:
        # Example compression by reducing quality to 60%
        img.save(upload_path, "JPEG", optimize=True, quality=60)
    
    # 4. Upload again into S3
    s3.upload_file(upload_path, target_bucket, key)
    
    # 5. Log into DynamoDB
    image_id = str(uuid.uuid4())
    table.put_item(
        Item={
            'ImageID': image_id,
            'OriginalName': key,
            'SourceBucket': bucket_name,
            'ProcessedAt': datetime.now().isoformat(),
            'Status': 'Success'
        }
    )
    
    return {
        'statusCode': 200,
        'body': f'Image {key} successfully compressed and logged.'
    }
```

## Configuring Permissions (IAM Role)
Lambda function needs "keys" to access other services. Make sure the Lambda Execution Role has the following policies:

1. AmazonS3FullAccess (or specific to your buckets): To read and upload images.
2. AmazonDynamoDBFullAccess: To write logs to the table.
3. AWSLambdaBasicExecutionRole: To allow Lambda to write logs to CloudWatch (for debugging). 

## Prepare the Lambda Trigger
In the AWS Lambda console:
1. Click on "Add Trigger".
2. Select "S3".
3. Choose your source bucket.
4. Select "Event type: All object create events".
5. (Optional) Check "Recursive invocation" if you want to trigger on all subfolders (be cautious: if you upload the compressed results to the same bucket, this can trigger an infinite loop. It's better to use a different bucket or filter by prefix/folder).

## Useful Tips
- **Memory**: Image compression can be memory-intensive. Set the Lambda memory to at least 512MB or more if you are processing large images.
- **Timeout**: The image processing might take several seconds, so increase the default Lambda timeout from 3 seconds to around 1 minute to avoid timeouts during processing.
