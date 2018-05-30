/**
 *  @description
 *      html下载器
 *  
 *  @class DownloadHTML
 *      处理 https、http 页面的下载
 * 
 */

const http = require("http");
const https = require("https");

class DownloadHTML {

    constructor() {
        this.protocol = http;
        this.regexp_protocol = /https/;
    }

    async get (url){

        if (this.regexp_protocol.test(url)) this.protocol = https;

        return new Promise((resolve, reject) => {

            console.log("下载中: %s", url);

            this.protocol.get(url, (res) => {

                const { statusCode } = res;
                const content_type = res.headers["content-type"];
                const content_length = res.headers["content-length"]
                
                let error;
                if (statusCode !== 200 && statusCode !== 304){
                    error = new Error(`请求失败, 状态码 ${statusCode}`);
                }
                if (!/text\/html/.test(content_type)){
                    error = new Error(`Content-Type 的类型不正确: ${content_type}`);
                }
    
                if (error){
                    console.error(error.message);
                    res.resume();
                    reject();
                    return ;
                }
    
                res.setEncoding("utf8");
                const chunks = [];
                res.on("data", (chunk) => {
                    chunks.push(chunk);

                    // 显示下载进度 ...
                    if (content_length){
                        const proportion = chunks.join("").length / content_length * 100;
                        console.log(`${url} 下载进度: ${proportion.toFixed(2)}%`);
                    }
                }); 
    
                res.on("end", () => {
                    resolve(chunks.join(""));
                });
    
            }).on("error", (e) => {
                console.error(`发生了错误: ${e.message || e.toString()}`);
                reject();
            });

        });
        

    }

}


module.exports = DownloadHTML;
