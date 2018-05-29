/**
 *  @description
 *      测试分词
 * 
 */


const model = require("../models/words.json");

const word_length = 4;
const word_ignore = ["你", "我", "在", "和", "了", "把", "和", "与", "为", "的", "一", "是", "这", "就"];

const splited_words = (str) => {

    const result = [];

    str = str.replace(/[^\u4e00-\u9fa5]/g, ' ');
    const words = str.split(/\s+/);


    for (let word of words){

        while (word.length > 1){
            
            let len = 1;
            const words_splited = word.substr(0, word_length);
            
            if ( ~word_ignore.indexOf(words_splited[0]) ){
                word = word.substr(len);
                continue;
            };

            let current_model = model;
            let find_str = "";
            for (const s of words_splited){
                if ( !(s in current_model) ){
                    break;
                }
                find_str += s;
                current_model = current_model[s];

                // console.log("运行中", find_str);
            }
            
            if (current_model.count >= 2 && find_str.length > 1){
                result.push(find_str);
                len = find_str.length;
            }
            word = word.substr(len);
        }

    }

    console.log("\r\n找到了", result);

};

{
    // 测试...
    
    splited_words("你好, 今天有空吗, 我想约你一起去看世界, 这就是宿命啊, 这个朝代已经腐朽了, 骷髅头");
    
    splited_words("阳光明媚的一天, 今天出去玩过山车");

    splited_words("想念, 小时候无忧无虑, 不需要考虑其他事情的时候, 每天可以准时到家打游戏, 也可以准时上课");

}


