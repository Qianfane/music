//70
import request from "../../utils/request";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], // 轮播图数据
    recommendList: [], // 推荐歌单数据
    topList: [], // 排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // wx.request({
    //   url: "http://localhost:3000/banner",
    //   data: {
    //     type: 1
    //   },
    //   success: (res) => {
    //     console.log("请求成功：", res)
    //   },
    //   fail: (err) => {
    //     console.log("请求失败：", err)
    //   }
    // })
    // 动态显示轮播图
    let bannerListData = await request("/banner", {type:2})
    // console.log(bannerListData)
    this.setData({
      bannerList: bannerListData.banners
    })

    // 动态显示推荐歌单
    let recommendListData = await request("/personalized?limit=10", {limit: 10})
    // console.log(recommendListData)
    this.setData({
      recommendList: recommendListData.result
    })

    // 动态显示排行榜歌单
    let resultArr = []
    let index = 0
    while (index < 5) {
      let topListData = await request("/top/list", {idx: index++})
      let topListItem = {
        name: topListData.playlist.name,
        tracks: topListData.playlist.tracks.slice(0, 3)
      }
      resultArr.push(topListItem)
      // 不需要全部数据获取到之后再渲染，减少白屏时间，提升用户体验，缺点是渲染次数增加了
      this.setData({
        topList: resultArr
      })
    }

    // console.log(resultArr)
  },

  /**
   * 点击每日推荐事件的回调
   */
  handleToRecommend: function () {
    wx.navigateTo({
      url: '../songPackage/pages/recommendSong/recommendSong'
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