/**
 * 封装一个请求函数
 * 注意点：
 *  1. 功能点要明确
 *  2. 函数内应该保留固定代码(静态)
 *  3. 把动态的内容抽取成形参，由使用者根据自身的情况动态传入实参
 *  4. 形参设置默认值
 */
import config from "./config";
export default (url, data={}, method="GET") => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.host + url,
      data,
      method,
      header: {
        cookie: wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1):''
      },

      success: (res) => {
        // 将cookie保存到本地
        if (data.isLogin) {
          wx.setStorage({
            key: "cookies",
            data: res.cookies
          })
        }

        resolve(res.data)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })

}



