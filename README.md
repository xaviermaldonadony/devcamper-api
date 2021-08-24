# DevCamper AP

> Backend API for DevCamper application,which is a bootcamp direcotry website

## Deployed with [heroku]()

## Usage

Rename 'config/config-template.env to 'config/config.env'

# Install Dependencies

```
npm install / yarn install
```

## Rup App

```
# Run in dev mode
npm run dev

# Run in Prod mode
npm start
```

##Documenation

#### Version: 1.0.0

API Documentation with example can be seen here [Devcamper API](https://documenter.getpostman.com/view/13777328/TzzEmtVd)

#### Implemented with

```
- Express
- postman
- MongoDB and Mongoose
  - Sorting, Filtering, Aggregations, Validators, Limiting
- Error Handilng
- Pug templates
- Authentication with JWT (in cookie)
- API Security
  - helmet for HTTP Headers
  - express-mongo-sanitize to prevent MongoDB Operator Injection - XSS portection for header
  - hpp for parameter pollutin
  - Rate Limit
- File Uploads
```
