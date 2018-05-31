/**
 *  @description
 *      测试分词
 * 
 */


const model = require("../models/words.json");

const { word_length, word_ignore, word_frequency } = require("../config");

const splited_words = (str) => {

    console.log("需要分词的语句:\r\n", str);

    const result = [];

    str = str.replace(/[^\u4e00-\u9fa5]/g, ' ');
    const words = str.split(/\s+/);

    // 4个分词, 每个字匹配, 看有效值, 有效值最大的保留, 其他丢失
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

            }
            
            if (current_model.count >= word_frequency && find_str.length > 1){
                result.push(find_str);
                len = find_str.length;
            }
            word = word.substr(len);
        }

    }

    console.log("\r\n找到了\r\n", result, "\r\n");

};

{
    // 测试...
    
    splited_words("你好, 今天有空吗, 我想约你一起去看世界, 这就是宿命啊, 这个朝代已经腐朽了, 骷髅头");
    
    splited_words("阳光明媚的一天, 今天出去玩过山车");

    splited_words("想念, 小时候无忧无虑, 不需要考虑其他事情的时候, 每天可以准时到家打游戏, 也可以准时上课");

    splited_words("致命的攻击, 对目标造成150%的武器伤害再加上214点伤害, 并为你恢复生命值, 数值相当于你之前5秒内所承受总伤害的20%(至少恢复死亡骑士最大生命值的7%)");

}


