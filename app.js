/* jshint ignore:start */
/*
 * AMP 入口文件
 */

import path from 'path';

import Koa from 'koa';
import Router from 'koa-router';
import Static from 'koa-static';
import Logger from 'koa-logger';
import Send from 'koa-send';
import KoaBodyParser  from 'koa-better-body';
import fs from 'fs';
import https from 'https';

import session from 'koa2-cookie-session';

// koa1中间件转换
import convert from 'koa-convert';

import routers from './routes';
import db from './config/db.json';
import mysqlMiddleware from './middleware/mysql';
import responseMiddleware from './middleware/response'

const app = new Koa();
const httpPort = 9090;
const httpsPort = 8989;
const options = {
    key: fs.readFileSync('./privatekey.pem'),
    cert: fs.readFileSync('./certificate.pem')
};


app.use(KoaBodyParser());
app.use(session());


// middleware
app.use(mysqlMiddleware);
app.use(responseMiddleware);

app.use(convert(Logger()));

app.use(convert(Static(path.join(__dirname, 'static'))));


for(let item of routers){
    app.use(item.routes(),item.allowedMethods());
}

// 错误处理
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx);
});

app.listen(httpPort);
https.createServer(options, app.callback()).listen(httpsPort);
