/**
 *  @description
 *      训练函数
 *      
 *  @class Train
 *      __words_splited: 分词
 *      __read_file: 读文件（按行读取）
 *      
 * 
 */


const fs = require("fs");
const path = require("path");
const readline = require("readline");

const say = (...args) => { console.log(...args); };

// 初始化分词对象
const model = {};
const word_length = 4;
const word_ignore = ["你", "我", "在", "和", "了", "把", "和", "与", "为", "的", "一", "是", "这", "就"];

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

        fs.writeFileSync(path.resolve(__dirname, "./models/words.json"), JSON.stringify(model, null, "\t"));
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
     *                  }
     *              }
     *          }
     *      }
     *  有效词汇 会有属性 count 标示, 此词汇出现的次数
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

            // current_model.count ? current_model.count++ : current_model.count = 1;
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

}



const train = new Train("./articles");
train.run();


