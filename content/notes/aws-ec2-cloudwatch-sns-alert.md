---
title: AWS EC2 CloudWatch SNS Alert
date: 2026-03-16
---

## Create an SNS Topic

Before CloudWatch can send an alert, it needs a "Topic" to send it to.

1. Open the **SNS Console**.
2. Select **Topics** > **Create topic**.
3. Choose **Standard**, name it (e.g., `My-EC2-Alerts`), and click **Create topic**.
4. Once created, click **Create subscription**:
   - **Protocol:** Email.
   - **Endpoint:** Your email address.
5. **Important:** Check your inbox and click the **Confirm Subscription** link in the email AWS sends you.

## Create the CloudWatch Alarm

Now, you tell CloudWatch what to look for on your EC2 instance.

1. Open the **CloudWatch Console**.
2. Go to **Alarms** > **All alarms** > **Create alarm**.
3. Click **Select metric**:
   - Browse to **EC2** > **Per-Instance Metrics**.
   - Find your Instance ID and select the metric **CPUUtilization**.
4. **Specify metric and conditions**:
   - **Threshold type:** Static.
   - **Whenever CPUUtilization is...:** Greater than 70.
   - **Datapoints to alarm:** 1 out of 1 (or 2 out of 2 if you want to avoid "flapping" on brief spikes).
5. Click **Next**.

## Configure the Action

This is where you link the alarm to your SNS topic.

1. **Alarm state trigger**: Select **In alarm**.
2. **Select an SNS topic**: Choose **Select an existing SNS topic**.
3. **Send a notification to...**: Choose the topic you created in Step 1 (e.g., `My-EC2-Alerts`).
4. (Optional) You can also add an **EC2 action** here to "Reboot" or "Terminate" the instance if it hits this threshold, though usually, you just want the email first.
5. Click **Next**, give the alarm a name (e.g., `High-CPU-Alert-Instance-X`), and click **Create alarm**.

