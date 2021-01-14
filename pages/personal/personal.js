import request from "../../utils/request";

let startY = 0
let moveY = 0
let moveDistance = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: '', // 移动距离
    coverTransition: '', // 过渡效果
    userInfo: '', // 用户信息
    recentPlayList: '' // 用户最近播放列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 从本地存储中获取用户信息数据
    let userInfo = wx.getStorageSync('userInfo')

    if (userInfo) { // 用户登录
      // 更新userInfo
      this.setData({
        userInfo: JSON.parse(userInfo)
      })

      // 获取最近播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId)

    }
  },

  // 获取用户最近播放记录的功能函数
  getUserRecentPlayList: async function (userId) {
    let recentPlayListData = await request("/user/record", { uid: userId, type: 0 })
    let index = 0
    let recentPlayList = recentPlayListData.allData.splice(0, 10).map((item) => {
      item.id = index++
      return item
    })

    this.setData({
      recentPlayList
    })
  },

  /**
   * 手指触摸动作开始处理事件
   */
  handleTouchStart: function (event) {
    startY = event.touches[0].clientY
    this.setData({
      coverTransition: ''
    })
  },

  /**
   * 手指触摸后移动处理事件
   */
  handleTouchMove: function (event) {
    moveY = event.touches[0].clientY
    moveDistance = moveY - startY
    if (moveDistance <= 0) {
      moveDistance = 0
    }
    if (moveDistance > 80) {
      moveDistance = 80
    }
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`
    })
  },

  /**
   * 手指触摸动作结束处理事件
   */
  handleTouchEnd: function () {
    this.setData({
      coverTransform: '',
      coverTransition: 'linear 1s'
    })
  },

  /**
   * 前往登录页面
   */
  goLogin: function () {
    wx.navigateTo({
      url: "/pages/login/login"
    })
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