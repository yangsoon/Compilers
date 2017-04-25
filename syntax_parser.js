const fs = require('fs');
const color = require('colors');
const express = require('express');
const Syntax = require('./syntax.js');
const data = fs.readFileSync('./syn_grammer2.txt', 'utf-8').split('\r\n');
const test = new Syntax();
// 读取语法文法
for (let i in data) {
    if (data[i].length > 0){
        test.readSyn(data[i], i);
    }
}
// 获得终结符和非终结符
test.getVn_Vt();
// 求出每个非终结符的first集
for(let vn of test.vn.values()){
    test.firstSet[vn] = test.getFirstSet(vn, new Set());
}
// 建立项目集
test.getSyntaxDFA();
//建立action goto表
test.getAction_Goto();
// console.log(test.vn);
// console.log(test.vt);
let app = new express();
app.get('/', (req, res) => res.send(test.projectSet));
app.get('/action', (req, res) => res.send(test.action));
app.get('/goto', (req, res) => res.send(test.goto));
app.listen(3000, (req, res) => console.log('syntax is running...'));
let token = fs.readFileSync('./out.txt', 'utf-8').split('\r\n');
let begin = 0;
let i = 0;
let j = 0;
let sign = [];
let state = [];
let action = test.action;
let goto = test.goto;
let vn = test.vn;
let vt = test.vt;
let pro = test.projectSet;
vt.add('#');
let exp = test.exp;
sign.push('#');
state.push(0);
while (token.length > 0) {
    // 终结符
    if (pro[state[i]].isacc) {
        console.log('ACCEPT'.blue);
        break;
    }
    t = token.shift();
    if (vt.has(t)) {
        if (action[state[i]].hasOwnProperty(t)) {
            if (!action[state[i]][t]['isend']) {
                state.push(action[state[i]][t]['next'][0]);
                sign.push(t);
                i = i + 1;
                j = j + 1;                
            }
            else {
                token.unshift(t);
                let index = action[state[i]][t]['next'];
                let temp = exp[index][0];
                let num = exp[index][1].length;
                i = i - num;
                j = j - num;
                while(num > 0) {
                    sign.pop();
                    state.pop();
                    num = num - 1;
                }
                token.unshift(temp);
            }
        }
        else {
            console.log('ERROR'.red);
            break;
        }
    }
    //非终结符
    else {
        if (goto[state[i]].hasOwnProperty(t)) {
            if (goto[state[i]][t].length > 1) {
                if (action[goto[state[i]][t][1]].hasOwnProperty(token[0])||goto[goto[state[i]][t][1]].hasOwnProperty(token[0])){
                    state.push(goto[state[i]][t][1]);
                }
                else {
                    state.push(goto[state[i]][t][0]);
                }   
            }
            else {
                state.push(goto[state[i]][t][0]);
            }     
            sign.push(t);
            i = i + 1;
            j = j + 1;      
        }
        else {
            console.log('ERROR'.red);
            break;
        }
    }
}