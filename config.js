
/**
 *  @description
 *      articles_path: 训练用数据目录
 *      models_path: 训练出的字典树存储
 *      word_length: 有效词语的长度
 *      word_frequency: 过滤出现频率过低的词
 *      word_ignore: 以此开头的词语无效, 过滤
 * 
 */

const config = {
    articles_path: "articles",
    models_path: "models",
    word_length: 4,
    word_frequency: 2,
    word_ignore: [
        "你", "我", "在", "和", "了", "把", "与", "为", "的", "有", "是", "就"
    ]
};

module.exports = config;
