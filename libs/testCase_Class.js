/* 传递目录,得到评测数据列表 */

const fs = require("fs")
const pathFn = require("path")
/**
 * 测试数据的类
 * @param {Object} args
 * @prop {Array} [args.input_regx=[] ] 输入文件的正则表达式
 * @prop {Array} [args.output_regx=[] ] 输出文件的正则表达式
 * @author rainboy
 */
class TestCase {
    constructor({input_regx =[],output_regx=[]} = {}){

        this.input_regx = [/.*\.in$/i,/.*\.input/i,/.*input.*/i].concat(input_regx)
        this.output_regx = [/.*\.out$/i,/.*\.ans/i,/.*\.output$/i,/.*output.*/i].concat(output_regx)

    }
}

TestCase.prototype.getExcludeNumName = function(fileName,reg){
    fileName =  fileName.replace(reg,'')
    let arr = fileName.match(/\D*/g)

    if( arr===null || arr.length === 0)
        return ''

    return arr.join('')

}
/**
 *@method getNum
 *@param {String} fileName 文件名
 *@return {Number} 文件名中的数字
 *@desc 得到文件名中的数字
 */
TestCase.prototype.getNum = function(fileName){

    if (typeof fileName !== "string") 
        throw('')

    //"/[1-9]\d{1,}/g",表示匹配1到9,一位数以上的数字(不包括一位数).
    //"/\d{2,}/g",  表示匹配至少二个数字至多无穷位数字
    var arr = fileName.match( /\d{1,}/g);
    if( arr===null || arr.length == 0)
        throw(`测试数据名: ${fileName} 中没有数字`)

    return parseInt( arr.join(''))
}

TestCase.prototype.testList = function(datalist=[]){

    /* 文件列表是否为空 */
    if( datalist.length === 0)
        throw('数据目录为空!')

    function matchList(reg,arr){
        for(let a of arr){
            if( reg.test(a))
                return true
        }
        return false
    }
    /* 得到input reg */
    let input_exreg = null
    for( reg of this.input_regx){
        if( matchList(reg,datalist)){
            input_exreg = reg
            break;
        }
    }

    if( input_exreg == null)
        throw('没有找到符合规则的输入数据名!')

    /* 得到output reg */
    let output_exreg = null
    for( reg of this.output_regx){
        if( matchList(reg,datalist)){
            output_exreg = reg
            break;
        }
    }
    if( output_exreg == null)
        throw('没有找到符合规则的输出数据名!')


    let inputs = []
    let outputs = []
    /* 得到名 */
    for(let f of datalist)
        if(input_exreg.test(f))
            inputs.push(f)
        else if(output_exreg.test(f))
            outputs.push(f)

    /* 排序 */
    inputs.sort((a,b)=>{return this.getNum(a) - this.getNum(b)})
    outputs.sort((a,b)=>{return this.getNum(a) - this.getNum(b)})

    /* 长度是否一样  */
    if( inputs.length !== outputs.length)
        throw('得到的输入,输出数据的数量不一样!')

    let combine = []
    for(let idx in  inputs){

        /*数字是否一样  */
        if( this.getNum(inputs[idx]) !== this.getNum(outputs[idx]))
            throw(`输入:${inputs[idx]},输出:${outputs[idx]} 名字不匹配`)
        /* 去除数字后是否一样 */
        if( this.getExcludeNumName(inputs[idx],input_exreg) !== this.getExcludeNumName(outputs[idx],output_exreg))
            throw(`输入:${inputs[idx]},输出:${outputs[idx]} 名字不匹配`)
        combine.push([
            inputs[idx],
            outputs[idx]
        ])
    }
    return combine
}
/**
 *@method testListByPath
 *@param {String} dataPath 数据路径
 *@param {Boolean} strict 是否开启严格模式
 *@return {Array} 返回数列列表,按所含数字从大小到排列
 *@prop {Array} [] 输入文件的正则表达式
 *@prop {Array} [args.output_regx=[] ] 输出文件的正则表达式
 *@desc 根据路径得到数据列表
 */
TestCase.prototype.testListByPath = function (dataPath=null,strict=false){
    if (typeof dataPath !== "string")
        throw('dataPath 参数需要一个字符串类型')
    /* 是否存在 && 文件夹*/
    if( fs.existsSync(dataPath)){
        let stat = fs.statSync(dataPath)
        if( ! stat.isDirectory()){
            throw("数据路径不是文件夹!")
        }
    }
    else
        throw(`数据目录不存在! ${dataPath}`)

    let _file_list = fs.readdirSync(dataPath)
    let file_list = _file_list.filter( d =>{
        let n_path = pathFn.join(dataPath,d)
        return fs.statSync(n_path).isFile()
    })

    return this.testList(file_list)
}


module.exports = TestCase
