to run script:
nodemon -r tsconfig-paths/register --transpile-only .\src\db-scripts\script.ts

to deploy
pm2 start yarn --name <scam-api> -- <dev>

# DB Script Feature

scanNoInfoRecord.ts => clear no data record

I want to base on sync-source create an other plugins support to upload source code change from current local to remote . Since sync-source is support sync remote change to local. plugins name will be upload-source

3rd API we will call using VERSION_CONTROL_API by using UPLOAD_SOURCE_SERVICE_TOKEN and SYNC_SOURCE_SERVICE_TOKEN

Create an endpoint POST method body params is sourceId (Require) to call API to get list files of behavior is the same 'update-source' but instead of replace local we will call 'file-versions' endpoint with POST method to upload files change body will be 
{
  "filePath": "string",
  "content": "string",
  "sourceId": "string",
  "incrementType": "patch"
}
and Authentication with UPLOAD_SOURCE_SERVICE_TOKEN
