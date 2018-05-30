/**
 *  @description
 *      html 分析器
 * 
 */

const cheerio = require("cheerio");
const url = require("url");

class ParserHTML {
    
    handle (current_url, doc){
        const $ = cheerio.load(doc);
    
        // 获取所有 a 标签
        const list = $("a[href]");
        const new_urls = new Set();
        list.each((i, ele) => {
            
            const ele_href = $(ele).attr("href");
            if (!ele_href || ele_href === "/") return ;

            const real_url = url.resolve(current_url, ele_href);
            new_urls.add(real_url);

        });

        // 获取网页内容
        let txt;
        const http_equiv = $("meta[http-equiv='Content-Type']");
        if (http_equiv.length){
            const content = http_equiv.attr("content");
            if ( !~content.indexOf("gb2312") && !~content.indexOf("gbk2312")){
                txt = $("body").text();
            };
        }

        return [ Array.from(new_urls), txt ];
    }

}

module.exports = ParserHTML;
