/**
 *  @description
 *      init_url: 爬虫入口
 *      running_count: 同时的请求数
 *      max_files: 需要有效爬取的数量
 *      max_fail: 检测是否被屏蔽了, 以连续N次爬取内容无效为标准
 *      suspend_json_name: 被站点屏蔽后, 以json方式将信息保存进此文件
 * 
 * 
 *  @class Spider
 *      run: 启动一个爬取
 *      __restart_run: 保持一定数量的请求在运行 
 *      __exit: 等待爬取到足够的文件，并且所有请求完成后退出
 *      __suspend: 被拒绝访问后, 暂停爬取, 并且保存 url管理器内的信息
 *      __save: 将url管理器内信息保存成json文件
 *      __resume: 
 *          1. 存在url管理器的json文件, 读取json文件, 并继续上次的爬取    
 *          2. 不存在url管理器的json文件, 初始化爬虫
 * 
 * 
 */

const fs = require("fs");
const path = require("path");

const { articles_path } = require("../config");

const UrlManage = require("./urls_manage");
const DownloadHTML = require("./download_html");
const ParserHTML = require("./parser_html");
const Output = require("./output");

const init_url = "http://www.mc26.com/jz/list_113_6.html";

const suspend_json_name = "suspend_urls.json";
const running_count = 10;
let max_files = 3000;
let max_fail = 100;



class Spider {

    constructor (max_waited_count){

        const { old_urls, new_urls, grabed_count } = this.__resume();

        this.url_manage = new UrlManage(old_urls, new_urls);
        this.download_html = new DownloadHTML();
        this.parser_html = new ParserHTML();
        this.output = new Output(articles_path, ( max_files - grabed_count + 1 ));

        this.waited_count = max_waited_count;
        this.b_running = true;

        this.need_files = grabed_count;
        this.request_fail = 0;

    }

    async run (init_url){

        if (this.need_files <= 0){
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
                this.need_files--;
                console.log("------------------------------------------------ \
                    还剩余: %d", this.need_files
                );
                this.output.generate_file(txt);
                this.request_fail = 0;
            } else {
                this.request_fail++;
                if (this.request_fail > max_fail){
                    this.__suspend();
                    return ;
                }
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

            if (fs.existsSync(this.urls_path)){
                try {
                    fs.unlinkSync(this.urls_path);
                    console.log("删除暂停记录文件成功 ...");                
                } catch(err){
                    console.error("删除暂停记录文件失败, 请手动检查", err.message || err.toString());
                }
            }

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

    __suspend (){
        if ( !this.suspend_timer ){
            console.log("当前ip貌似被屏蔽了, 准备暂停 ...");
            let times = 10;
            this.__save();

            this.suspend_timer = setInterval(() => {
                if (times === 0){
                    console.log("... 暂停 .");
                    clearInterval(this.suspend_timer);
                    process.exit(0);
                }
                console.log("暂停倒计时: %d 秒", times--);
            });
        }
    }

    // 暂停: 将set转成json保存
    __save (){

        const urls = {
            old_urls: Array.from(this.url_manage.old_urls),
            new_urls: Array.from(this.url_manage.new_urls),
            grabed_count: this.need_files
        };
        
        fs.writeFileSync(path.resolve(__dirname, suspend_json_name), JSON.stringify(urls, null, "\t"));
    }

    // 读取: 暂停时保存的json文件
    __resume (){

        this.urls_path = path.resolve(__dirname, suspend_json_name);
        if (fs.existsSync(this.urls_path)){
            const suspend_urls = require(`${this.urls_path}`);

            console.log("继续上一次的爬取 ...");
            return suspend_urls;
        }

        console.log("新的爬取 ....");
        return { old_urls: undefined, new_urls: undefined, grabed_count: max_files };

    }

}

{

    const o_spider = new Spider(running_count);
    o_spider.run(init_url);

}





