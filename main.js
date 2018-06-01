/**
 *  @description
 *      训练函数
 *      
 *  @class Train
 *      __words_splited: 分词
 *      __read_file: 读文件（按行读取）
 *      __ignore_rare: 过滤训练中出现较少的词
 * 
 */


const fs = require("fs");
const path = require("path");
const readline = require("readline");

const { articles_path, models_path, word_length, word_ignore, word_frequency } = require("./config");

// 初始化分词对象
const model = Object.create(null);

const say = (...args) => { console.log(...args); };

class Train {

    constructor (articles_directory){
        
        this.dir_path = path.resolve(__dirname, articles_directory);
        this.file_list = fs.readdirSync(this.dir_path);

    }

    async run (){

        if ( !this.file_list.length ){
            throw Error("没有找到可以用于训练的文件");
        }

        for ( let file of this.file_list ){

            say("\r\n开始读取 %s 文件 \r\n", file);

            await this.__read_file(file);

            say("\r\n文件: %s 完成", file);

        }

        say("开始过滤 - 出现频率过低的词, 减少字典树大小, 请稍等 ...");

        this.__ignore_rare(model);  
        fs.writeFileSync(path.resolve(__dirname, `${models_path}/words.json`), JSON.stringify(model, null, "\t"));

        say("训练完成 ...");
    }

    /**
     *  @description
     *      每个句子按最长4个词长度 组成有效词语
     *  
     *  @e.g
     *      {
     *          "你": {
     *              "好": {
     *                  "count": 1
     *              },
     *              "在": {
     *                  "吗": {
     *                      "count": 1
     *                  },
     *                  "count": 1
     *              },
     *              "count": 1
     *          }
     *      }
     *  count 标示, 此词汇出现的次数
     *  
     */
    __words_splited (word){

        for (let i = 0, l = word.length - 1; i < l; i++){

            const words_splited = word.substr(i, word_length);

            if ( ~word_ignore.indexOf(words_splited[0]) ) continue;

            let current_model = model;

            for (let s of words_splited){
                if ( !(s in current_model) ){
                    current_model[s] = { count: 0 };
                }
                current_model = current_model[s];
                current_model.count++;
            }

        }

    }

    async __read_file (file){

        // if (file !== "test_1.txt"){ return ; }

        const rl = readline.createInterface({
            input: fs.createReadStream(path.join(this.dir_path, file)),
            crlfDelay: Infinity
        });

        return new Promise(resolve => {

            let words_tail = "";

            rl.on("line", (line) => {
                
                if (line){
                    
                    // 按行读取, 防止换行的时候语句依旧是一句话的情况, 将上段分割后的最后一个词拼接这段
                    line = `${words_tail}${line}`;
                    words_tail = "";

                    // 非汉字全部替换
                    line = line.replace(/[^\u4e00-\u9fa5]/g, ' ');
                    const words = line.split(/\s+/);

                    // 记录此段的最后一个词
                    if (words.length > 1){
                        words_tail = words.pop();
                    }

                    for (const word of words){
                        this.__words_splited(word);
                    }

                }

            });
    
            rl.on("close", () => {
                words_tail && this.__words_splited(words_tail);
                resolve();
            });

        });
        
    }

    __ignore_rare (obj, name){
        const child = name ? obj[name] : obj;

        // 过滤 - 树形结构的叶
        if (Object.keys(child).length === 1) return ;

        // 过滤 - 树形结构的支, 比对 count 大小
        for (let s in child){
            if (s !== "count" && child[s]["count"] >= word_frequency){
                this.__ignore_rare(child, s);
                continue;
            }
            s !== "count" && delete child[s];
        }
    }

}


{
    const train = new Train(articles_path);
    train.run();
}



