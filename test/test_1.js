/**
 *  @description
 *      测试分词
 * 
 */


const model = require("../models/words.json");

const { word_length, word_ignore, word_frequency } = require("../config");


/**
 *  @description 比对方式1
 *      将字符串从首位开始按最长词语长度生成词语, 比对字典树, 将有效字段提出,
 *      剩下的无效字段与没有参与比对的字符串在重复上一步的行为,
 *      直到字符串消耗完
 *   
 */
const core = (word, result) => {

    while (word.length > 1){
            
        let len = 1;
        const words_splited = word.substr(0, word_length);
        
        if ( ~word_ignore.indexOf(words_splited[0]) ){
            word = word.substr(len);
            continue;
        }

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

};

/**
 *  @description 比对方式2
 *      将字符串中每个字符按照最长词语长度生成词语
 *      将所有词语对比字典树, 得到其词汇值
 *      将不冲突并且词汇值较大的词语提出, 视为有效词语
 *      剩下被上一步分割后的多个零星字符串, 在重复这个过程
 *      直到字符串被消耗完或剩余零星字符串无法组成字符串, 丢弃
 * 
 */

// const core2 = (word, result) => {

//     const word_list = word.split("");
//     let words = [];
//     for (let i=0, l=word_list.length; i<l; i++){
//         let count=2;
//         while ( l - i - count > -1 && count <= word_length){
//             const split_words = word_list.slice(i, i + count);
//             split_words.index = i;
//             words.push(split_words);
//             count++;
//         }
//     }

//     for (let idiom of words){
//         if ( ~word_ignore.indexOf(idiom[0]) ) continue;

//         let current_model = model;
//         let find_str = "";
//         for (const s of idiom){
//             if ( !(s in current_model) ){
//                 break;
//             }
//             find_str += s;
//             current_model = current_model[s];
//         }

//         console.log(find_str);
//         console.log(current_model.count);

//     }

// };

const splited_words = (str) => {

    console.log("需要分词的语句:\r\n", str);

    const result = [];

    str = str.replace(/[^\u4e00-\u9fa5]/g, ' ');
    const words = str.split(/\s+/);

    for (let word of words){

        core(word, result);

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


