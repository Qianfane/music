import PubSub from 'pubsub-js'
import moment from 'moment'
import request from "../../../utils/request";

// 获取全局实例
const appInstance = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, // 音乐是否播放
    song: [], // 歌曲详情对象
    musicId: '', // 音乐id
    currentTime: '00:00',  // 实时时间
    durationTime: '00:00', // 总时长
    currentWidth: 0, // 实时进度条的宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 通过 onLoad 函数的 options 参数接收路由跳转的 query 参数
    let musicId = options.musicId
    this.getSongDetailData(musicId)
    this.setData({
      musicId
    })

    /**
     * 判断全局音乐是否播放，如果全局播放的音乐和当前页面音乐相同，则修改音乐播放的状态
     */
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      this.setData({
        isPlay: true
      })
    }

    /**
     * 问题：当用户点击操作系统的控制音乐播放/暂停的按钮时，页面并不知道，
     *      导致页面显示音乐是否播放的状态和真实的状态不一致
     * 解决方案：
     *    1. 添加控制音频实例的播放/暂停/停止事件
     */
    // 添加控制音频实例的播放/暂停/停止事件
    this.backgroundAudioManager = wx.getBackgroundAudioManager() // 获取背景音频管理器的实例
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true)

      // 将当前播放的音乐音乐 id 保存到全局数据中
      appInstance.globalData.musicId = musicId
    })
    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false)
    })
    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false)
    })

    // 监听音乐播放自然结束
    this.backgroundAudioManager.onEnded(() => {
      // 自动切换至下一首音乐，并且自动播放
      PubSub.publish('switchType', 'next')
      // 将实时进度条的长度还原成 0；时间还原成 0；
      this.setData({
        currentWidth: 0,
        currentTime: '00:00'
      })
    });
    
    // 监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      // console.log('总时长: ', this.backgroundAudioManager.duration);
      // console.log('实时的时长: ', this.backgroundAudioManager.currentTime);
      // 格式化实时的播放时间
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
      let currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration * 450;
      this.setData({
        currentTime,
        currentWidth
      })
    })
  },  

  /**
   * 修改 isPlay 状态的功能函数
   */
  changePlayState: function (isPlay) {
    this.setData({
      isPlay
    })

    // 将当前播放的音乐的播放状态保存到全局数据中
    appInstance.globalData.isMusicPlay = isPlay
  },

  /**
   * 请求歌曲详情的功能函数
   */
  getSongDetailData: async function (musicId) {
    let songDetailData = await request("/song/detail", {ids: musicId})
    // songData.songs[0].dt 单位ms
    let durationTime = moment(songDetailData.songs[0].dt).format('mm:ss');
    this.setData({
      song: songDetailData.songs[0],
      durationTime
    })
    // 动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.name
    })
  },

  /**
   * 点击播放/暂停的回调
   */
  handleMusicPlay() {
    let isPlay = !this.data.isPlay

    this.setData({ // 改变是否播放的状态
      isPlay
    })
    this.musicControl(this.data.isPlay, this.data.musicId)
  },

  /**
   * 控制音乐播放的功能函数
   */
  musicControl: async function (isPlay, musicId) {
    // 获取背景音频管理器的实例
    // let backgroundAudioManager = wx.getBackgroundAudioManager()
    if (isPlay) { // 播放音乐
      let musicLinkData = await request("/song/url", {id: musicId})
      let musicLink = musicLinkData.data[0].url;
      // 设置背景音频管理器实例 属性
      this.backgroundAudioManager.src = musicLink
      this.backgroundAudioManager.title = this.data.song.name // 必填
    } else { // 暂停播放
      this.backgroundAudioManager.pause()
    }
  },

  /**
   * 点击切换歌曲的回调
   */
  handleSwitch: function (event) {
    // 停止播放当前音乐
    this.backgroundAudioManager.stop()
    let type = event.currentTarget.id

    // 发布消息数据给 recommendSong 页面
    PubSub.publish('swichType', type);

    // 订阅来自 recommendSong 页面的音乐id消息
    PubSub.subscribe('musicId', (msg, musicId) => {
      // 请求歌曲详情
      this.getSongDetailData(musicId)
      // 控制音乐自动播放
      this.musicControl(true, musicId)
      console.log(msg, musicId)
      // 取消订阅
      PubSub.unsubscribe('musicId');
    });
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