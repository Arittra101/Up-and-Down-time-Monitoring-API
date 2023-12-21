# Website Monitoring with Node.js

## Overview

This Node.js project empowers clients to monitor the status of their websites. If there's a change in the website's status (up or down), clients receive SMS notifications via the Twilio API. The entire project is implemented using raw Node.js, and the file system is used as a simple database.

## Features

### Website Monitoring

- Clients can check the status of their websites.
- Periodic requests are sent to websites to determine their status.

### SMS Notifications

- Twilio API is integrated for sending SMS notifications.
- Clients receive instant alerts on status changes.

### Data Storage

- File system serves as a lightweight database.
- Information about websites and client settings is stored in files.

## Getting Started

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Arittra101/Up-and-Down-time-Monitoring-API.git
