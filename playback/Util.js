/*
 * @Author: xuan
 * @LastEditors: xuan
 * @Description: 
 * @Date: 2016-12-05 10:52:53
 * @LastEditTime: 2023-03-01 16:00:02
 */

export function isArray(arr) {
    return Array.isArray ? Array.isArray(arr) : Object.prototype.toString.call(arr) === '[object Array]'
}

export function isFunction(func) {
    return Object.prototype.toString.call(func) === '[object Function]'
}

