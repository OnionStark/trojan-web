import request from '@/utils/request'

// 登录接口
export function login(data) {
    return request.post('/auth/login', data)
}
// 注册接口(首次初始化admin)
export function register(data) {
    return request.post('/auth/register', data)
}
// 访客自助注册trojan用户
export function signup(data) {
    return request.post('/auth/signup', data)
}
// 查询自助注册是否开放(公开)
export function registerStatus() {
    return request.get('/auth/registerStatus')
}
// 检查有没有初始化接口
export function check() {
    return request.get('/auth/check')
}
// 重置密码接口
export function resetPass(data) {
    return request.post('/auth/reset_pass', data)
}
// 获取请求用户名
export function loginUser() {
    return request.get('/auth/loginUser')
}
