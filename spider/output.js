/**
 *  @description
 *      写入文件...
 * 
 * 
 */


const fs = require("fs");
const path = require("path");


class Output {

    constructor (articles_path){
        this.count = 20;
        this.articles_path = articles_path;
    }

    generate_file (txt){
        this.count++;
        fs.writeFileSync(path.resolve(this.articles_path, `article_${this.count}.txt`), txt);
    }

}

module.exports = Output;

