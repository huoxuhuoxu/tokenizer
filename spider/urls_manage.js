
/**
 *  @description
 *      url管理器
 *  
 *  @class UrlManage
 *      待爬取的url、已经爬取完成的url管理
 * 
 */

class UrlManage {

    constructor (old_urls, new_urls){
        this.old_urls = old_urls ? new Set(old_urls) : new Set();
        this.new_urls = new_urls ? new Set(new_urls) : new Set();
    }

    // 检测还是还存在待爬取url
    has_url (){
        return !!this.new_urls.size;
    }

    // 获取新url
    get_url (){
        if (this.has_url()){
            const arr_urls = Array.from(this.new_urls);
            const url = arr_urls.shift();
            this.old_urls.add(url);
            this.new_urls = new Set(arr_urls);
            return url;
        }
    }   

    // 是否已经爬取过
    __in_urls (url){
        return this.old_urls.has(url) || this.new_urls.has(url);
    }

    // 添加新url
    add_urls (urls){
        if (! (urls && urls.length) ) return ;
        for (const url of urls){
            if ( this.__in_urls(url) ) continue ;
            this.new_urls.add(url);
        }
    }

    // 重新添加回待爬取
    reset_url (url){
        this.old_urls.delete(url);
        this.new_urls.add(url);
    }

}

module.exports = UrlManage;

