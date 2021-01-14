import request from "../../utils/request";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: '',  // 导航标签数据
    navId: '',  // 导航标签标识
    videoList: '',  // 视频数据
    videoId: '', // 视频标识
    videoTimeUpdate: [],  // 记录 video 播放时长
    triggered: false,  // scroll-view 下拉刷新状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取导航数据
    this.getVideoGroupList()
  },

  /**
   * 获取导航数据函数
   */
  getVideoGroupList: async function () {
    let videoGroupListData = await request("/video/group/list")
    let videoGroupList = videoGroupListData.data.slice(0, 14)
    // 修改导航标签数据，动态显示导航标签
    this.setData({
      videoGroupList,
      navId: videoGroupList[0].id*1
    })

    // 获取视频数据
    this.getVideoList(this.data.navId)
  },

  /**
   * 获取视频数据
   */
  // phone=   15711140593       &password=        123456yzy
  getVideoList: async function (navId) {
    let videoListData = await request("/video/group", {id: navId})

    // 为视频数组元素设置唯一标识
    let index = 0
    console.log("--------videoListData")
    console.log(videoListData)
    let videoList = videoListData.datas.map(item => {
      item.id = index++
      return item
    })
    this.setData({
      videoList,
      triggered: false // 关闭 scroll-view 下拉刷新
    })

    // 隐藏 loading 提示框
    wx.hideLoading()
  },

  /**
   * 点击切换导航的回调
   */
  changeNav: function (event) {
    // 改变当前导航的底部颜色
    let navId = event.currentTarget.id // 当用id给event传参时，会将Number类型参数转换为String类型
    // let navId = event.currentTarget.dataset.id
    this.setData({
      // navId: navId*1
      navId: navId>>>0, // 右移0位，将String类型强制转换为Number类型
      videoList: []
    })

    // 显示loadinig提示框
    wx.showLoading({
      title: '正在加载'
    })
    // 获取视频数据
    this.getVideoList(navId)
  },

  /**
   * 点击播放/继续播放的回调
   */
  handlePlay: function (event) {
    /**
     * 需求：
     *    1. 播放视频之后获取本视频的 id
     *    2. 播放视频之后找到并关闭之前已经播放的视频
     * 问题：
     *    1. 如何获取上一个视频的 videoContext 实例
     *    2. 如何判断是否为继续播放
     *
     * 单例模式
     *    what：需要创建多个对象的场景下，通过一个变量接收，始终保持只有一个对象
     *    优点：节省内存空间
     */
    let vid = event.currentTarget.id // 获取视频唯一标识

    this.setData({
      videoId: vid
    })
    // 关闭上一个正在播放的视频
    // this.vid != vid && this.videoContext && this.videoContext.stop()
    this.videoContext = wx.createVideoContext(vid) // videoContext 实例，操作 video
    this.videoContext.play()
    // this.vid = vid // 把 vid 保存到 this，以便下次判断是否为同一视频
  },

  /**
   * 处理视频进度变化的回调
   */
  handleTimeUpdate: function (event) {
    /*
     * 需求：点击视频，判断视频是否被播放过
     *   1. 如果是，则从之前停止的地方开始播放
     *   2. 如果不是，则从头开始播放
     *
     * 方案：保存每个视频的 vid 以及播放时长数据
     *
     */

    let videoTimeObj = {videoId: event.currentTarget.id, currentTime: event.detail.currentTime}
    let {videoTimeUpdate} = this.data // 拿到记录播放时长的数据
    // 寻找有没有本视频播放记录
    let videoItem = videoTimeUpdate.find(item => item.videoId === event.currentTarget.id)

    if (videoItem) { // 之前有播放记录对象
      // 找到该播放记录对象，修改播放时长
      videoItem.currentTime = event.detail.currentTime
    }else { // 之前没有播放记录对象
      // 插入播放记录对象
      videoTimeUpdate.push(videoTimeObj)
    }
    // 修改 videoTimeUpdate 的状态
    this.setData({
      videoTimeUpdate
    })
  },

  /**
   * 视频播放结束的回调
   */
  handleEnded: function (event) {

    let {videoTimeUpdate} = this.data // 拿到记录播放时长的数据
    // 视频播放结束，应移除记录播放对象数组中当前 video 的播放对象
    videoTimeUpdate.splice(videoTimeUpdate.findIndex(item => {item.videoId === event.currentTarget.id}),1)
  },

  /**
   * 自定义下拉刷新的回调 scroll-view
   */
  handleRefresh: function () {
    console.log("刷新")
    // 再次发请求，获取最新视频的列表
    this.getVideoList(this.data.navId)
  },

  /**
   * 下拉到底部的回调 scroll-view
   */
  handleToLower: function () {
    console.log('scroll-view 上拉触底');
    // 模拟数据
    let newVideoList = [
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_509DF6FBD1DFFFE5F3637E8C37F1D4D1",
            "coverUrl": "https://p2.music.126.net/Q7KKs0patsJuchgN7uLC0Q==/109951164785396538.jpg",
            "height": 1080,
            "width": 1920,
            "title": "徐真真《当妮走了》LIVE 现场邀请超好看的女观众唱hook",
            "description": "徐真真《当妮走了》LIVE 现场邀请超好看的女观众唱hook部分\n\nBaby当你走了 我发誓不会堕落 \n即使当妮走后 也关注你的微博 \n这次真的走了 生命最美的过客 \n那还在等什么 谢谢你给的沉默",
            "commentCount": 288,
            "shareCount": 201,
            "resolutions": [
              {
                "resolution": 240,
                "size": 44234027
              },
              {
                "resolution": 480,
                "size": 56288650
              },
              {
                "resolution": 720,
                "size": 102867058
              },
              {
                "resolution": 1080,
                "size": 156819009
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 610000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/dmSONOuKjm6h2hJsJnZYrg==/109951164608528935.jpg",
              "accountStatus": 0,
              "gender": 2,
              "city": 610100,
              "birthday": 1577808000000,
              "userId": 1962762251,
              "userType": 204,
              "nickname": "IN_LIVE",
              "signature": "一个LIVE摄录制作团队，让更多的人爱上音乐和LIVE。谢谢您的关注呀～\n\n关于LIVE视频的一些说明：\n对于由于以前录制的素材在现场离音响很近会有爆音，为了综合观感所以会替换掉部分音轨用录音室版本；机位视角不好的时候会替换为其他演唱时的片段不一定完全能对得上口形。\n\n我们只是音乐的爱好者很难按照idol的演唱会级别去录制地下歌手的现场，我们只想尽自己的微薄力量让这个文化让更多人喜欢。来记录那些大家参与过或者错过了的LIVE碎片。如果有侵犯到艺人的权益请私信我进行稿件处理。\n\n最后感谢您对这个文化的喜爱。",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951164608528930,
              "backgroundImgId": 109951162868128400,
              "backgroundUrl": "http://p1.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951162868128395.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": {
                "1": "音乐视频达人"
              },
              "djStatus": 0,
              "vipType": 0,
              "remarkName": null,
              "avatarImgIdStr": "109951164608528935",
              "backgroundImgIdStr": "109951162868128395",
              "avatarImgId_str": "109951164608528935"
            },
            "urlInfo": {
              "id": "509DF6FBD1DFFFE5F3637E8C37F1D4D1",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/LZhF9YMs_2930924210_uhd.mp4?ts=1605592138&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=jtEkNtjYcXJQFGAJJiNTfJrAEHkBBPHE&sign=0cf04d45883dcaa4064abfd1c1e76620&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANIOB778zOa0GNkWKbpJigsU0quHnsfoBJFhskiGNyHSDR8B5%2FDIrdbCIIpwcE3GK86QtuRZN%2BnQShdnwuV9U7FNJ2OXIcYnWFayJh9r%2B5BzTe4Pnk8siWYysW%2B1dlQQGF1mDD8n%2Ffq6%2B1hb39VZpEvpUSO%2FejdYDZgZIAKSAe390hUqwIysEn6D48sHUV5QMJoXiCtgiU7ibmQElUMxFzcP",
              "size": 156819009,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 1080
            },
            "videoGroup": [
              {
                "id": -31129,
                "name": "#rapper 说情话#",
                "alg": "groupTagRank"
              },
              {
                "id": 59101,
                "name": "华语现场",
                "alg": "groupTagRank"
              },
              {
                "id": 59108,
                "name": "巡演现场",
                "alg": "groupTagRank"
              },
              {
                "id": 57108,
                "name": "流行现场",
                "alg": "groupTagRank"
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": "groupTagRank"
              },
              {
                "id": 58100,
                "name": "现场",
                "alg": "groupTagRank"
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": "groupTagRank"
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": null,
            "relateSong": [
              {
                "name": "当妮走了",
                "id": 430793721,
                "pst": 0,
                "t": 0,
                "ar": [
                  {
                    "id": 12094099,
                    "name": "徐真真",
                    "tns": [],
                    "alias": []
                  }
                ],
                "alia": [],
                "pop": 100,
                "st": 0,
                "rt": "",
                "fee": 8,
                "v": 24,
                "crbt": null,
                "cf": "",
                "al": {
                  "id": 34878256,
                  "name": "当妮走了",
                  "picUrl": "http://p3.music.126.net/6rutfuUq9RFByWwGNy_FrQ==/17939631719002226.jpg",
                  "tns": [],
                  "pic_str": "17939631719002226",
                  "pic": 17939631719002226
                },
                "dt": 229428,
                "h": {
                  "br": 320000,
                  "fid": 0,
                  "size": 9179472,
                  "vd": -16000
                },
                "m": {
                  "br": 192000,
                  "fid": 0,
                  "size": 5507701,
                  "vd": -13400
                },
                "l": {
                  "br": 128000,
                  "fid": 0,
                  "size": 3671815,
                  "vd": -11900
                },
                "a": null,
                "cd": "1",
                "no": 1,
                "rtUrl": null,
                "ftype": 0,
                "rtUrls": [],
                "djId": 0,
                "copyright": 2,
                "s_id": 0,
                "cp": 1416590,
                "mv": 5363859,
                "rtype": 0,
                "rurl": null,
                "mst": 9,
                "publishTime": 1474351753428,
                "privilege": {
                  "id": 430793721,
                  "fee": 8,
                  "payed": 0,
                  "st": 0,
                  "pl": 128000,
                  "dl": 0,
                  "sp": 7,
                  "cp": 1,
                  "subp": 1,
                  "cs": false,
                  "maxbr": 999000,
                  "fl": 128000,
                  "toast": false,
                  "flag": 2,
                  "preSell": false
                }
              }
            ],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "509DF6FBD1DFFFE5F3637E8C37F1D4D1",
            "durationms": 287083,
            "playTime": 796918,
            "praisedCount": 3064,
            "praised": false,
            "subscribed": false
          }
        },
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_2174EDBCC5D7F85C4CDAE6996875EF3F",
            "coverUrl": "https://p2.music.126.net/kfQONPIAPlpnlwawgAB2kg==/109951165210838220.jpg",
            "height": 1080,
            "width": 1920,
            "title": "VIA Shohona va Durdona Qurbanova - Qilpillama",
            "description": "VIA Shohona va Durdona Qurbanova - Qilpillama",
            "commentCount": 14,
            "shareCount": 150,
            "resolutions": [
              {
                "resolution": 240,
                "size": 68688181
              },
              {
                "resolution": 480,
                "size": 116706920
              },
              {
                "resolution": 720,
                "size": 172627739
              },
              {
                "resolution": 1080,
                "size": 232896422
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 650000,
              "authStatus": 1,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/czL408tLMWuiuiPtT1xyKw==/109951164713770188.jpg",
              "accountStatus": 0,
              "gender": 1,
              "city": 652900,
              "birthday": 883584000000,
              "userId": 134559930,
              "userType": 4,
              "nickname": "Sir丶Official",
              "signature": "歌曲是我的世界的一部分.. 💖",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951164713770190,
              "backgroundImgId": 109951165270148690,
              "backgroundUrl": "http://p1.music.126.net/-mjjZjhrYxH90jTUhqC2gA==/109951165270148689.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": [
                "华语"
              ],
              "experts": {
                "1": "音乐视频达人"
              },
              "djStatus": 10,
              "vipType": 11,
              "remarkName": null,
              "avatarImgIdStr": "109951164713770188",
              "backgroundImgIdStr": "109951165270148689",
              "avatarImgId_str": "109951164713770188"
            },
            "urlInfo": {
              "id": "2174EDBCC5D7F85C4CDAE6996875EF3F",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/t0ZSbwIb_3081333071_uhd.mp4?ts=1605592138&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=spdauipRPcGZIKFqgCWDrYNBFUxWZRlY&sign=d81df11a28df133642de3b2940c2f6b6&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANIOB778zOa0GNkWKbpJigsU0quHnsfoBJFhskiGNyHSDR8B5%2FDIrdbCIIpwcE3GK86QtuRZN%2BnQShdnwuV9U7FNJ2OXIcYnWFayJh9r%2B5BzTe4Pnk8siWYysW%2B1dlQQGF1mDD8n%2Ffq6%2B1hb39VZpEvpUSO%2FejdYDZgZIAKSAe390hUqwIysEn6D48sHUV5QMJoXiCtgiU7ibmQElUMxFzcP",
              "size": 232896422,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 1080
            },
            "videoGroup": [
              {
                "id": 25137,
                "name": "音乐资讯",
                "alg": "groupTagRank"
              },
              {
                "id": 23116,
                "name": "音乐推荐",
                "alg": "groupTagRank"
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": "groupTagRank"
              },
              {
                "id": 58100,
                "name": "现场",
                "alg": "groupTagRank"
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": "groupTagRank"
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": null,
            "relateSong": [
              {
                "name": "Qilpillama",
                "id": 1350655870,
                "pst": 0,
                "t": 0,
                "ar": [
                  {
                    "id": 77894,
                    "name": "Shahzoda",
                    "tns": [],
                    "alias": []
                  },
                  {
                    "id": 0,
                    "name": "Alisher Fayz",
                    "tns": [],
                    "alias": []
                  }
                ],
                "alia": [],
                "pop": 50,
                "st": 0,
                "rt": "",
                "fee": 8,
                "v": 3,
                "crbt": null,
                "cf": "",
                "al": {
                  "id": 75798315,
                  "name": "Sen menga kerak (2014)",
                  "picUrl": "http://p3.music.126.net/lBen8t1VQeHd5kh66GGfFQ==/109951163911011986.jpg",
                  "tns": [],
                  "pic_str": "109951163911011986",
                  "pic": 109951163911011980
                },
                "dt": 161351,
                "h": {
                  "br": 320000,
                  "fid": 0,
                  "size": 6456468,
                  "vd": -2
                },
                "m": {
                  "br": 192000,
                  "fid": 0,
                  "size": 3873898,
                  "vd": -2
                },
                "l": {
                  "br": 128000,
                  "fid": 0,
                  "size": 2582613,
                  "vd": -2
                },
                "a": null,
                "cd": "01",
                "no": 10,
                "rtUrl": null,
                "ftype": 0,
                "rtUrls": [],
                "djId": 0,
                "copyright": 1,
                "s_id": 0,
                "cp": 743010,
                "mv": 0,
                "rtype": 0,
                "rurl": null,
                "mst": 9,
                "publishTime": 1401897600000,
                "privilege": {
                  "id": 1350655870,
                  "fee": 8,
                  "payed": 0,
                  "st": 0,
                  "pl": 128000,
                  "dl": 0,
                  "sp": 7,
                  "cp": 1,
                  "subp": 1,
                  "cs": false,
                  "maxbr": 999000,
                  "fl": 128000,
                  "toast": false,
                  "flag": 263,
                  "preSell": false
                }
              }
            ],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "2174EDBCC5D7F85C4CDAE6996875EF3F",
            "durationms": 269143,
            "playTime": 73698,
            "praisedCount": 408,
            "praised": false,
            "subscribed": false
          }
        },
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_A61EECC58CE5D8F8444DD955EE37064A",
            "coverUrl": "https://p2.music.126.net/2ES2soqw4SnZX7NKNd2wmQ==/109951163680676957.jpg",
            "height": 1080,
            "width": 1920,
            "title": "开口脆，太好听了！看Lena若有所思的眼神~德国好声音儿童版",
            "description": "James Morrison - I Won_'t Let You Go (Laurin) The Voice Kids 2013 Blind Auditions",
            "commentCount": 323,
            "shareCount": 684,
            "resolutions": [
              {
                "resolution": 240,
                "size": 13489800
              },
              {
                "resolution": 480,
                "size": 21609103
              },
              {
                "resolution": 720,
                "size": 30740499
              },
              {
                "resolution": 1080,
                "size": 48863080
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 420000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/u2UclkSLln_uY3cLodf32A==/7945071023153547.jpg",
              "accountStatus": 0,
              "gender": 1,
              "city": 421300,
              "birthday": 591120000000,
              "userId": 77798117,
              "userType": 204,
              "nickname": "管管736",
              "signature": "传递快乐，治愈不开心。B站：管管丶",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 7945071023153547,
              "backgroundImgId": 2002210674180199,
              "backgroundUrl": "http://p1.music.126.net/VTW4vsN08vwL3uSQqPyHqg==/2002210674180199.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": null,
              "djStatus": 0,
              "vipType": 11,
              "remarkName": null,
              "avatarImgIdStr": "7945071023153547",
              "backgroundImgIdStr": "2002210674180199"
            },
            "urlInfo": {
              "id": "A61EECC58CE5D8F8444DD955EE37064A",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/B4mBlG8Q_2135860886_uhd.mp4?ts=1605592138&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=hDVOQmqPrfZDJKGQOvByOXOvsMZoTIxI&sign=9802cb60fe4ad1e7d053dca87f2c758e&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANIOB778zOa0GNkWKbpJigsU0quHnsfoBJFhskiGNyHSDR8B5%2FDIrdbCIIpwcE3GK86QtuRZN%2BnQShdnwuV9U7FNJ2OXIcYnWFayJh9r%2B5BzTe4Pnk8siWYysW%2B1dlQQGF1mDD8n%2Ffq6%2B1hb39VZpEvpUSO%2FejdYDZgZIAKSAe390hUqwIysEn6D48sHUV5QMJoXiCtgiU7ibmQElUMxFzcP",
              "size": 48863080,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 1080
            },
            "videoGroup": [
              {
                "id": 75122,
                "name": "欧美综艺",
                "alg": "groupTagRank"
              },
              {
                "id": 76108,
                "name": "综艺片段",
                "alg": "groupTagRank"
              },
              {
                "id": 3101,
                "name": "综艺",
                "alg": "groupTagRank"
              },
              {
                "id": 4101,
                "name": "娱乐",
                "alg": "groupTagRank"
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": "groupTagRank"
              },
              {
                "id": 58100,
                "name": "现场",
                "alg": "groupTagRank"
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": "groupTagRank"
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": null,
            "relateSong": [],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "A61EECC58CE5D8F8444DD955EE37064A",
            "durationms": 227997,
            "playTime": 1650195,
            "praisedCount": 6864,
            "praised": false,
            "subscribed": false
          }
        },
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_9D566DDBCFB2C3E4B5C96ACFAC405323",
            "coverUrl": "https://p2.music.126.net/zfz61-prYWmFT6v2pyMFsw==/109951163781152704.jpg",
            "height": 1080,
            "width": 1920,
            "title": "Stellar Vibrato",
            "description": null,
            "commentCount": 38,
            "shareCount": 31,
            "resolutions": [
              {
                "resolution": 240,
                "size": 25040445
              },
              {
                "resolution": 480,
                "size": 43295056
              },
              {
                "resolution": 720,
                "size": 64148977
              },
              {
                "resolution": 1080,
                "size": 116554145
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 500000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/o5GyOxpIeusWJGq-WLpTGg==/109951164078172711.jpg",
              "accountStatus": 0,
              "gender": 2,
              "city": 500101,
              "birthday": 832521600000,
              "userId": 1299210887,
              "userType": 0,
              "nickname": "韩国音乐现场精选",
              "signature": "",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951164078172700,
              "backgroundImgId": 109951164077876480,
              "backgroundUrl": "http://p1.music.126.net/mjIa6bBYI03ffrSxEEi0OA==/109951164077876488.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": {
                "1": "舞蹈视频达人"
              },
              "djStatus": 0,
              "vipType": 0,
              "remarkName": null,
              "avatarImgIdStr": "109951164078172711",
              "backgroundImgIdStr": "109951164077876488",
              "avatarImgId_str": "109951164078172711"
            },
            "urlInfo": {
              "id": "9D566DDBCFB2C3E4B5C96ACFAC405323",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/ZgtUQwic_2240216958_uhd.mp4?ts=1605592138&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=cWQewGpTPlokgoUmEKYrqyJGERXvnkKy&sign=09241445c3601de1d8b460d051fafba5&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANIOB778zOa0GNkWKbpJigsU0quHnsfoBJFhskiGNyHSDR8B5%2FDIrdbCIIpwcE3GK86QtuRZN%2BnQShdnwuV9U7FNJ2OXIcYnWFayJh9r%2B5BzTe4Pnk8siWYysW%2B1dlQQGF1mDD8n%2Ffq6%2B1hb39VZpEvpUSO%2FejdYDZgZIAKSAe390hUqwIysEn6D48sHUV5QMJoe2o1IDWPBHoXMMF3l73aL",
              "size": 116554145,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 1080
            },
            "videoGroup": [
              {
                "id": 57107,
                "name": "韩语现场",
                "alg": "groupTagRank"
              },
              {
                "id": 57110,
                "name": "饭拍现场",
                "alg": "groupTagRank"
              },
              {
                "id": 57108,
                "name": "流行现场",
                "alg": "groupTagRank"
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": "groupTagRank"
              },
              {
                "id": 58100,
                "name": "现场",
                "alg": "groupTagRank"
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": "groupTagRank"
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": null,
            "relateSong": [],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "9D566DDBCFB2C3E4B5C96ACFAC405323",
            "durationms": 182382,
            "playTime": 146490,
            "praisedCount": 388,
            "praised": false,
            "subscribed": false
          }
        },
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_1D4D5365BE32DB5FA5C5EED98BD269C5",
            "coverUrl": "https://p2.music.126.net/to1u_d7pSSunTEqQqvl5GA==/109951163573407789.jpg",
            "height": 360,
            "width": 640,
            "title": "Jaden的这个台风，有点太帅了！！！",
            "description": "Jaden的这个台风，有点太帅了！！！",
            "commentCount": 223,
            "shareCount": 145,
            "resolutions": [
              {
                "resolution": 720,
                "size": 63388664
              },
              {
                "resolution": 480,
                "size": 55979632
              },
              {
                "resolution": 240,
                "size": 27301543
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 110000,
              "authStatus": 1,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/gOs7yWD8uU53OkoeNJZUOg==/18619129906643177.jpg",
              "accountStatus": 0,
              "gender": 1,
              "city": 110101,
              "birthday": 716745600000,
              "userId": 115025640,
              "userType": 4,
              "nickname": "营养怪兽",
              "signature": "微博@营养怪兽 本人就是我",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 18619129906643176,
              "backgroundImgId": 109951162868126480,
              "backgroundUrl": "http://p1.music.126.net/_f8R60U9mZ42sSNvdPn2sQ==/109951162868126486.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": null,
              "djStatus": 10,
              "vipType": 11,
              "remarkName": null,
              "avatarImgIdStr": "18619129906643177",
              "backgroundImgIdStr": "109951162868126486",
              "avatarImgId_str": "18619129906643177"
            },
            "urlInfo": {
              "id": "1D4D5365BE32DB5FA5C5EED98BD269C5",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/rTw5UAe3_1534808908_shd.mp4?ts=1605592138&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=SWZfMOabnzTWmyZQCEbjGdgPKgIBKCwD&sign=36fae68f543180fad6fc3e84c5348415&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANIOB778zOa0GNkWKbpJigsU0quHnsfoBJFhskiGNyHSDR8B5%2FDIrdbCIIpwcE3GK86QtuRZN%2BnQShdnwuV9U7FNJ2OXIcYnWFayJh9r%2B5BzTe4Pnk8siWYysW%2B1dlQQGF1mDD8n%2Ffq6%2B1hb39VZpEvpUSO%2FejdYDZgZIAKSAe390hUqwIysEn6D48sHUV5QMJoe2o1IDWPBHoXMMF3l73aL",
              "size": 63388664,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 720
            },
            "videoGroup": [
              {
                "id": 57106,
                "name": "欧美现场",
                "alg": "groupTagRank"
              },
              {
                "id": 13164,
                "name": "快乐",
                "alg": "groupTagRank"
              },
              {
                "id": 59108,
                "name": "巡演现场",
                "alg": "groupTagRank"
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": "groupTagRank"
              },
              {
                "id": 58100,
                "name": "现场",
                "alg": "groupTagRank"
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": "groupTagRank"
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": null,
            "relateSong": [
              {
                "name": "Icon",
                "id": 519342924,
                "pst": 0,
                "t": 0,
                "ar": [
                  {
                    "id": 1033005,
                    "name": "Jaden",
                    "tns": [],
                    "alias": []
                  }
                ],
                "alia": [],
                "pop": 80,
                "st": 0,
                "rt": null,
                "fee": 1,
                "v": 12,
                "crbt": null,
                "cf": "",
                "al": {
                  "id": 36823304,
                  "name": "SYRE",
                  "picUrl": "http://p4.music.126.net/x4qhuQCIyOqPEGz7wu2aCA==/18854425393141931.jpg",
                  "tns": [],
                  "pic_str": "18854425393141931",
                  "pic": 18854425393141932
                },
                "dt": 221048,
                "h": {
                  "br": 320000,
                  "fid": 0,
                  "size": 8843015,
                  "vd": -24600
                },
                "m": {
                  "br": 192000,
                  "fid": 0,
                  "size": 5305826,
                  "vd": -22000
                },
                "l": {
                  "br": 128000,
                  "fid": 0,
                  "size": 3537232,
                  "vd": -20000
                },
                "a": null,
                "cd": "1",
                "no": 11,
                "rtUrl": null,
                "ftype": 0,
                "rtUrls": [],
                "djId": 0,
                "copyright": 1,
                "s_id": 0,
                "cp": 7003,
                "mv": 5737077,
                "rtype": 0,
                "rurl": null,
                "mst": 9,
                "publishTime": 1510848000007,
                "privilege": {
                  "id": 519342924,
                  "fee": 1,
                  "payed": 0,
                  "st": 0,
                  "pl": 0,
                  "dl": 0,
                  "sp": 0,
                  "cp": 0,
                  "subp": 0,
                  "cs": false,
                  "maxbr": 320000,
                  "fl": 0,
                  "toast": false,
                  "flag": 1028,
                  "preSell": false
                }
              }
            ],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "1D4D5365BE32DB5FA5C5EED98BD269C5",
            "durationms": 190497,
            "playTime": 423342,
            "praisedCount": 2070,
            "praised": false,
            "subscribed": false
          }
        },
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_2685CF0AC8908FC374F88CCC7FB00DDD",
            "coverUrl": "https://p2.music.126.net/89yJhszILhCijUG8ZtocOw==/109951163573709737.jpg",
            "height": 720,
            "width": 1280,
            "title": "问你飞不飞 做大哥的滋味美不美～",
            "description": null,
            "commentCount": 368,
            "shareCount": 1064,
            "resolutions": [
              {
                "resolution": 240,
                "size": 39951606
              },
              {
                "resolution": 480,
                "size": 66610797
              },
              {
                "resolution": 720,
                "size": 87632176
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 510000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/EjQlMX9Qce2ouwVoJu3gwQ==/109951163157820882.jpg",
              "accountStatus": 0,
              "gender": 0,
              "city": 510100,
              "birthday": 631123200000,
              "userId": 125287048,
              "userType": 0,
              "nickname": "shababa123",
              "signature": "cdc的精神领导我的动作",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951163157820880,
              "backgroundImgId": 109951163303513630,
              "backgroundUrl": "http://p1.music.126.net/U9E98aWYZV6VV-cCdVM2AA==/109951163303513639.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": null,
              "djStatus": 0,
              "vipType": 11,
              "remarkName": null,
              "avatarImgIdStr": "109951163157820882",
              "backgroundImgIdStr": "109951163303513639",
              "avatarImgId_str": "109951163157820882"
            },
            "urlInfo": {
              "id": "2685CF0AC8908FC374F88CCC7FB00DDD",
              "url": "http://vodkgeyttp9.vod.126.net/cloudmusic/j7ThWL1r_1676439667_shd.mp4?ts=1605592138&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=jEZkJYzSvELOsHUlgGGIXTuWhxPZUWGC&sign=a32226a2d3784b6f4baf80ec621677e5&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANIOB778zOa0GNkWKbpJigsU0quHnsfoBJFhskiGNyHSDR8B5%2FDIrdbCIIpwcE3GK86QtuRZN%2BnQShdnwuV9U7FNJ2OXIcYnWFayJh9r%2B5BzTe4Pnk8siWYysW%2B1dlQQGF1mDD8n%2Ffq6%2B1hb39VZpEvpUSO%2FejdYDZgZIAKSAe390hUqwIysEn6D48sHUV5QMJoe2o1IDWPBHoXMMF3l73aL",
              "size": 87632176,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 720
            },
            "videoGroup": [
              {
                "id": 57110,
                "name": "饭拍现场",
                "alg": "groupTagRank"
              },
              {
                "id": 59101,
                "name": "华语现场",
                "alg": "groupTagRank"
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": "groupTagRank"
              },
              {
                "id": 58100,
                "name": "现场",
                "alg": "groupTagRank"
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": "groupTagRank"
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": null,
            "relateSong": [],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "2685CF0AC8908FC374F88CCC7FB00DDD",
            "durationms": 186000,
            "playTime": 1191257,
            "praisedCount": 6017,
            "praised": false,
            "subscribed": false
          }
        },
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_F2E957BB474683231F230DB456DF59A6",
            "coverUrl": "https://p2.music.126.net/lo2ZOYysWiQ_2-9w0b6Keg==/109951163674647974.jpg",
            "height": 720,
            "width": 1280,
            "title": "今年选秀最佳现场，这首歌第一次有男声驾驭的如此完美",
            "description": "这个歌手叫Dalton Harris，潮爷我听过很多音色和他差不多的男歌手，但是能把Listen这首非常有难度的歌曲驾驭的这么完美，还是第一次见到。关注我公众号，回复Listen，可以获得音频版本下载。真的只有这样牛逼的版本才能值得让我单独把音频提取出来！给大佬跪了！！",
            "commentCount": 44,
            "shareCount": 83,
            "resolutions": [
              {
                "resolution": 240,
                "size": 20976258
              },
              {
                "resolution": 480,
                "size": 36795966
              },
              {
                "resolution": 720,
                "size": 52750377
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 1000000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/kUVHpqutFXe66oYa9TWC3g==/109951163267792477.jpg",
              "accountStatus": 0,
              "gender": 1,
              "city": 1004400,
              "birthday": 636912000000,
              "userId": 563466341,
              "userType": 204,
              "nickname": "马克潮爷",
              "signature": "发现那些主流之外的美。",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951163267792480,
              "backgroundImgId": 109951163001946050,
              "backgroundUrl": "http://p1.music.126.net/zviPW48W7VYGbFCaO8ffFg==/109951163001946054.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": {
                "1": "音乐视频达人"
              },
              "djStatus": 0,
              "vipType": 11,
              "remarkName": null,
              "avatarImgIdStr": "109951163267792477",
              "backgroundImgIdStr": "109951163001946054",
              "avatarImgId_str": "109951163267792477"
            },
            "urlInfo": {
              "id": "F2E957BB474683231F230DB456DF59A6",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/007wonXJ_2130529076_shd.mp4?ts=1605592138&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=jRaayFXRjFUDvrfUcOnpFNyOFXETomZN&sign=8c31297d10e0829067e6db9352f0cd33&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANIOB778zOa0GNkWKbpJigsU0quHnsfoBJFhskiGNyHSDR8B5%2FDIrdbCIIpwcE3GK86QtuRZN%2BnQShdnwuV9U7FNJ2OXIcYnWFayJh9r%2B5BzTe4Pnk8siWYysW%2B1dlQQGF1mDD8n%2Ffq6%2B1hb39VZpEvpUSO%2FejdYDZgZIAKSAe390hUqwIysEn6D48sHUV5QMJoXiCtgiU7ibmQElUMxFzcP",
              "size": 52750377,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 720
            },
            "videoGroup": [
              {
                "id": -12481,
                "name": "#★【欧美】超爽节奏控2★#",
                "alg": "groupTagRank"
              },
              {
                "id": 3101,
                "name": "综艺",
                "alg": "groupTagRank"
              },
              {
                "id": 4101,
                "name": "娱乐",
                "alg": "groupTagRank"
              },
              {
                "id": 57106,
                "name": "欧美现场",
                "alg": "groupTagRank"
              },
              {
                "id": 57108,
                "name": "流行现场",
                "alg": "groupTagRank"
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": "groupTagRank"
              },
              {
                "id": 58100,
                "name": "现场",
                "alg": "groupTagRank"
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": "groupTagRank"
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": [
              101
            ],
            "relateSong": [
              {
                "name": "Listen",
                "id": 2188846,
                "pst": 0,
                "t": 0,
                "ar": [
                  {
                    "id": 48436,
                    "name": "Beyoncé",
                    "tns": [],
                    "alias": []
                  }
                ],
                "alia": [],
                "pop": 100,
                "st": 0,
                "rt": "600902000002671984",
                "fee": 8,
                "v": 22,
                "crbt": null,
                "cf": "",
                "al": {
                  "id": 220770,
                  "name": "Listen",
                  "picUrl": "http://p4.music.126.net/U2T_-AUbnZIOutcBVDSR5w==/109951163208503350.jpg",
                  "tns": [],
                  "pic_str": "109951163208503350",
                  "pic": 109951163208503340
                },
                "dt": 220440,
                "h": {
                  "br": 320000,
                  "fid": 0,
                  "size": 8820027,
                  "vd": -52234
                },
                "m": {
                  "br": 192000,
                  "fid": 0,
                  "size": 5292034,
                  "vd": -49632
                },
                "l": {
                  "br": 128000,
                  "fid": 0,
                  "size": 3528037,
                  "vd": -47937
                },
                "a": null,
                "cd": "1",
                "no": 1,
                "rtUrl": null,
                "ftype": 0,
                "rtUrls": [],
                "djId": 0,
                "copyright": 0,
                "s_id": 0,
                "cp": 7001,
                "mv": 308028,
                "rtype": 0,
                "rurl": null,
                "mst": 9,
                "publishTime": 1170000000007,
                "privilege": {
                  "id": 2188846,
                  "fee": 8,
                  "payed": 0,
                  "st": 0,
                  "pl": 128000,
                  "dl": 0,
                  "sp": 7,
                  "cp": 1,
                  "subp": 1,
                  "cs": false,
                  "maxbr": 999000,
                  "fl": 128000,
                  "toast": false,
                  "flag": 260,
                  "preSell": false
                }
              }
            ],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "F2E957BB474683231F230DB456DF59A6",
            "durationms": 174293,
            "playTime": 150542,
            "praisedCount": 567,
            "praised": false,
            "subscribed": false
          }
        },
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_CFC35FBC4C82279CF1A28CADA5A0CABD",
            "coverUrl": "https://p2.music.126.net/8krPWpxRd8g4ISc5EIfLjQ==/109951165021917452.jpg",
            "height": 720,
            "width": 1280,
            "title": "Blackpink 【Kill this love】现场版(东京巨蛋)",
            "description": null,
            "commentCount": 20,
            "shareCount": 199,
            "resolutions": [
              {
                "resolution": 240,
                "size": 26969016
              },
              {
                "resolution": 480,
                "size": 47748399
              },
              {
                "resolution": 720,
                "size": 70302404
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 420000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/0uP_wOgU2ic4YkKwuE5u1g==/109951163868727403.jpg",
              "accountStatus": 0,
              "gender": 1,
              "city": 420100,
              "birthday": 818784000000,
              "userId": 63877044,
              "userType": 0,
              "nickname": "I曾经红过",
              "signature": "浪子一枚",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951163868727410,
              "backgroundImgId": 109951164228777020,
              "backgroundUrl": "http://p1.music.126.net/ySz0x7rSzAMq1ycXhzV1Kw==/109951164228777021.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": null,
              "djStatus": 10,
              "vipType": 0,
              "remarkName": null,
              "avatarImgIdStr": "109951163868727403",
              "backgroundImgIdStr": "109951164228777021",
              "avatarImgId_str": "109951163868727403"
            },
            "urlInfo": {
              "id": "CFC35FBC4C82279CF1A28CADA5A0CABD",
              "url": "http://vodkgeyttp9.vod.126.net/cloudmusic/6ETkL6Xu_3014565783_shd.mp4?ts=1605592138&rid=3009063014E119FC636C42FBC02D0085&rl=3&rs=WufhVxgWoIIIgRUMEoxLleVBastwlrKA&sign=edb7be2bd5903aeeb375a5428918aac7&ext=f0xw0mOJqGcf8yfMQn4khLo0vOAZ2Oret6FDS9VvANIOB778zOa0GNkWKbpJigsU0quHnsfoBJFhskiGNyHSDR8B5%2FDIrdbCIIpwcE3GK86QtuRZN%2BnQShdnwuV9U7FNJ2OXIcYnWFayJh9r%2B5BzTe4Pnk8siWYysW%2B1dlQQGF1mDD8n%2Ffq6%2B1hb39VZpEvpUSO%2FejdYDZgZIAKSAe390hUqwIysEn6D48sHUV5QMJoe2o1IDWPBHoXMMF3l73aL",
              "size": 70302404,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 720
            },
            "videoGroup": [
              {
                "id": -8003,
                "name": "#点赞榜#",
                "alg": "groupTagRank"
              },
              {
                "id": 92105,
                "name": "BLACKPINK",
                "alg": "groupTagRank"
              },
              {
                "id": 60101,
                "name": "日语现场",
                "alg": "groupTagRank"
              },
              {
                "id": 59108,
                "name": "巡演现场",
                "alg": "groupTagRank"
              },
              {
                "id": 57108,
                "name": "流行现场",
                "alg": "groupTagRank"
              },
              {
                "id": 1101,
                "name": "舞蹈",
                "alg": "groupTagRank"
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": "groupTagRank"
              },
              {
                "id": 58100,
                "name": "现场",
                "alg": "groupTagRank"
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": "groupTagRank"
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": null,
            "relateSong": [
              {
                "name": "Kill This Love -JP Ver.-",
                "id": 1397226690,
                "pst": 0,
                "t": 0,
                "ar": [
                  {
                    "id": 12068017,
                    "name": "BLACKPINK",
                    "tns": [],
                    "alias": []
                  }
                ],
                "alia": [],
                "pop": 100,
                "st": 0,
                "rt": "",
                "fee": 8,
                "v": 4,
                "crbt": null,
                "cf": "",
                "al": {
                  "id": 82451822,
                  "name": "KILL THIS LOVE -JP Ver.-",
                  "picUrl": "http://p3.music.126.net/d5f0JT-aXwW-x-maVb19zQ==/109951164430153547.jpg",
                  "tns": [],
                  "pic_str": "109951164430153547",
                  "pic": 109951164430153550
                },
                "dt": 189544,
                "h": {
                  "br": 320000,
                  "fid": 0,
                  "size": 7582868,
                  "vd": -47120
                },
                "m": {
                  "br": 192000,
                  "fid": 0,
                  "size": 4549738,
                  "vd": -44704
                },
                "l": {
                  "br": 128000,
                  "fid": 0,
                  "size": 3033173,
                  "vd": -43462
                },
                "a": null,
                "cd": "01",
                "no": 1,
                "rtUrl": null,
                "ftype": 0,
                "rtUrls": [],
                "djId": 0,
                "copyright": 1,
                "s_id": 0,
                "cp": 7003,
                "mv": 0,
                "rtype": 0,
                "rurl": null,
                "mst": 9,
                "publishTime": 1571155200000,
                "privilege": {
                  "id": 1397226690,
                  "fee": 8,
                  "payed": 0,
                  "st": 0,
                  "pl": 128000,
                  "dl": 0,
                  "sp": 7,
                  "cp": 1,
                  "subp": 1,
                  "cs": false,
                  "maxbr": 320000,
                  "fl": 128000,
                  "toast": false,
                  "flag": 4,
                  "preSell": false
                }
              }
            ],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "CFC35FBC4C82279CF1A28CADA5A0CABD",
            "durationms": 195000,
            "playTime": 260393,
            "praisedCount": 2539,
            "praised": false,
            "subscribed": false
          }
        }
      ]
    let videoList = this.data.videoList
    videoList.push(...newVideoList)
    this.setData({
      videoList
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
  onShareAppMessage: function ({from}) {
    console.log(from)
    if (from === "button") {
      return {
        title: "来自button转发内容",
        path: "/pages/video/video",
        imageUrl: "/static/images/nvshen.jpg"
      }
    }else {
      return {
        title: "来自menu转发内容",
        path: "/pages/video/video",
        imageUrl: "/static/images/nvshen.jpg"
      }
    }


  }
})