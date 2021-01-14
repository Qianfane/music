/**
 * 登录功能步骤
 * 1. 收集表单数据
 * 2. 前端验证
 *    1) 验证手机号和密码格式
 *          如果不通过则提示用户
 *          如果通过则进入后端验证
 * 3. 后端验证
 *    1) 验证手机号是否存在
 *          如果不存在返回错误
 *          如果存在则验证密码
 *    2) 验证密码
 *          如果不正确返回错误
 *          如果正确提示登录成功
 *
 */
import request from "../../utils/request";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '', // 手机号
    password: '', // 密码
    // userInfo: '' // 用户信息

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 收集表单数据函数
   */
  handleInput: function (event) {
    // let type = event.currentTarget.id  // id 标识
    let type = event.currentTarget.dataset.type // 利用 event.currentTarget.dataset.xxx 获取自定义标识
    this.setData({
      // 根据上面获取的 type ，改变相对应手机号或者密码值
      [type]: event.detail.value // 赋值 phone || password
    })
  },

  /**
   *  登录验证
   */
  login: async function () {
    // 1. 收集表单数据
    let { phone, password } = this.data
    // 2. 前端验证
    /**
     * 1) 检查手机号是否为空
     * 2) 检查手机号是否合法
     * 3) 检查密码是否为空
     */
    // 1) 检查手机号是否为空
    if (!phone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      })
      return
    }

    // 2) 检查手机号是否合法
    let phoneReg = /^1[3456789]\d{9}$/
    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: '手机号有误',
        icon: 'none'
      })
      return
    }

    // 3) 检查密码是否为空
    if (!password) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
      return;
    }

    // 3. 后端验证
    let result = await request('/login/cellphone', { phone, password, isLogin: true })
    // 手机号密码正确
    if (result.code === 200) {
      wx.showToast({
        title: '登录成功'
      })

      // 将用户的信息保存到本地
      wx.setStorageSync('userInfo', JSON.stringify(result.profile))

      // 登录成功，跳转到个人中心
      wx.reLaunch({
        url: "/pages/personal/personal"
      })
    } else if (result.code === 400) {
      wx.showToast({
        title: '手机号错误',
        icon: 'none'
      })
    } else if (result.code === 502) {
      wx.showToast({
        title: '密码错误',
        icon: 'none'
      })
    } else {
      wx.showToast({
        title: '登录失败，请重新登录',
        icon: 'none'
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})