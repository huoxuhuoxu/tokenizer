/**
 *  @description
 *      爬取通用语句: "http://www.mc26.com/jz/list_113_6.html"
 * 
 * 
 *  @class Spider
 *      run: 启动一个爬取
 *      __restart_run: 保持一定数量的请求在运行 
 *      __exit: 等待爬取到足够的文件，并且所有请求完成后退出
 *      
 * 
 */

const events = require("events");

const { articles_path } = require("../config");
const UrlManage = require("./urls_manage");
const DownloadHTML = require("./download_html");
const ParserHTML = require("./parser_html");
const Output = require("./output");

const init_url = "http://www.mc26.com/jz/list_113_6.html";

const running_count = 10;
let max_files = 1000;

class Spider {

    constructor (max_waited_count){

        this.url_manage = new UrlManage();
        this.download_html = new DownloadHTML();
        this.parser_html = new ParserHTML();
        this.output = new Output(articles_path);

        this.waited_count = max_waited_count;
        this.b_running = true;

    }

    async run (init_url){

        if (max_files <= 0){
            this.b_running = false;
            this.__exit();
            return ;
        }

        const url = init_url || this.url_manage.get_url();
        if ( !url ) return ;

        this.waited_count--;
        try {

            const doc_txt = await this.download_html.get(url);
            const [ new_urls, txt ] = this.parser_html.handle(url, doc_txt);

            console.log("找到新的url: %d 条", new_urls.length);

            this.url_manage.add_urls(new_urls);
            if (txt){
                max_files--;
                console.log("------------------------------------------------ \
                    还剩余: %d", max_files
                );
                this.output.generate_file(txt);
            }

        } catch(err){
            console.error(err.message || err.toString());
            console.log("重新添加回待爬取列队: %s", url);
            this.url_manage.reset_url(url);
        }

        // 重启爬取, 降低频率
        await new Promise(resolve => {
            setTimeout(resolve, 1000);
        });
        this.waited_count++;
        this.__restart_run();

    }

    __restart_run (){
        for (let i=0; i < ~~(this.b_running && this.waited_count); i++){
            this.run();
        }
    }

    __exit (){
        if ( !this.timer ){
            this.timer = setInterval(() => {
                console.log("等待结束中: ", this.waited_count, running_count);
                if (this.waited_count === running_count){
                    console.log("所有请求全部结束 ...");
                    clearInterval(this.timer);
                    process.exit(0);
                }
            }, 1000);
        }
    }

}

{

    const o_spider = new Spider(running_count);
    o_spider.run(init_url);

}





