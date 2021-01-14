// pages/recommendSong/recommendSong.js
import PubSub from 'pubsub-js'
import request from "../../../utils/request";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: '', // 天
    month: '', // 月
    recommendList: [], // 推荐列表数据
    index: 0, // 音乐下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 判断用户是否登录
    let userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) { // 用户没有登录
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: function () {
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }
      })
    }

    // 获取推荐列表数据
    this.getRecommendListData()

    // 获取推荐列表数据
    this.setData({
      day: new Date().getDate(), // 初始化日期中的天
      month: new Date().getMonth() + 1, // 初始化日期中的月
      // recommendList
    })

    // 订阅来自 songDetail 页面的消息
    PubSub.subscribe('swichType', (msg, type) => {
      // console.log(msg, type)
      let {recommendList, index} = this.data

      if (type === 'pre') { // 切换上一首
        (index === 0) && (index = recommendList.length)
        index -= 1
      } else { // 切换下一首
        (index === recommendList.length - 1) && (index = -1)
        index += 1
      }
      // 修改音乐下标值
      this.setData({
        index
      })

      // 将待播放音乐 id 传给 songDetail 页面
      let musicId = recommendList[index].id
      // 发布来自 recommendSong 页面的音乐id消息
      PubSub.publish('musicId', musicId);

    });
  },

  /**
   * 获取推荐列表数据
   */
  getRecommendListData: async function () {
    let recommendListData = await request("/recommend/songs")
    // console.log(recommendListData)
    let recommendList = recommendListData.recommend
    this.setData({
      recommendList
    })
  },

  /**
   * 点击前往歌曲详情页的回调
   */
  toSongDetail: function (event) {
    let {song, index} = event.currentTarget.dataset
    this.setData({
      index
    })

    // 跳转并通过路由传参
    wx.navigateTo({url: '//pages/songDetail/songDetail?musicId=' + song.id})


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