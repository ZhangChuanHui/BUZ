/**
 *  作者：张传辉
 *  功能名称：此脚本做ES6 API方法导入
 *     babel、transform-runtime 在转换ES6时，只针对语法转换
 *     不会转换ES6 API方法，通报polyfill做前置挡板。
 *     详见core-js
*/

import "core-js/es6/object"
import "core-js/es6/array"
import "core-js/es6/promise"