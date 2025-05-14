<template>
	<view class="detail-container">
		<view v-if="loading" class="loading">
			<text>加载中...</text>
		</view>
		<view v-else class="detail-content">
			<!-- 标题和作者信息 -->
			<view class="header">
				<view class="title-box">
					<text class="title">{{travel.title}}</text>
					<view class="status-tag" :class="getStatusClass(travel.status)">
						{{getStatusText(travel.status)}}
					</view>
				</view>
				
				<view class="author-info">
					<image class="avatar" :src="travel.avatarUrl || '/static/default-avatar.png'"></image>
					<view class="author-details">
						<text class="nickname">{{travel.nickname}}</text>
						<text class="time">发布时间: {{formatTime(travel.createTime)}}</text>
					</view>
				</view>
			</view>
			
			<!-- 游记内容 -->
			<view class="content">
				<text class="content-text">{{travel.content}}</text>
				
				<!-- 图片预览 -->
				<view class="image-grid">
					<view v-for="(img, index) in travel.images" :key="index" class="image-item">
						<image :src="img" mode="aspectFill" @click="previewImage(index)"></image>
					</view>
				</view>
				
				<!-- 视频 -->
				<view v-if="travel.video" class="video-container">
					<video :src="travel.video" controls></video>
				</view>
			</view>
			
			<!-- 统计数据 -->
			<view class="stats-section">
				<view class="stat-item">
					<text class="stat-icon">👁️</text>
					<text class="stat-value">{{travel.viewCount || 0}}</text>
				</view>
				<view class="stat-item">
					<text class="stat-icon">❤️</text>
					<text class="stat-value">{{travel.likeCount || 0}}</text>
				</view>
				<view class="stat-item">
					<text class="stat-icon">💬</text>
					<text class="stat-value">{{travel.commentCount || 0}}</text>
				</view>
			</view>
			
			<!-- 拒绝原因(如果有) -->
			<view v-if="travel.status === 2 && travel.rejectReason" class="reject-reason">
				<text class="reason-title">拒绝原因：</text>
				<text class="reason-content">{{travel.rejectReason}}</text>
			</view>
			
			<!-- 操作按钮 -->
			<view class="action-section">
				<button v-if="travel.status === 0 && hasPermission('approve')" class="action-btn approve" @click="handleApprove">通过审核</button>
				<button v-if="travel.status === 0 && hasPermission('reject')" class="action-btn reject" @click="handleReject">拒绝</button>
				<button v-if="hasPermission('delete')" class="action-btn delete" @click="handleDelete">删除游记</button>
				<button class="action-btn back" @click="goBack">返回列表</button>
			</view>
		</view>
		
		<!-- 拒绝弹窗 -->
		<view v-if="showRejectDialog" class="modal-mask">
			<view class="modal-container">
				<view class="modal-title">拒绝原因</view>
				<textarea v-model="rejectReason" placeholder="请输入拒绝原因" class="modal-input"></textarea>
				<view class="modal-footer">
					<button @click="cancelReject" class="modal-btn cancel">取消</button>
					<button @click="confirmReject" class="modal-btn confirm">确认</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import adminConfig from '../../utils/admin.js';

export default {
	data() {
		return {
			id: '',
			loading: true,
			userInfo: {
				username: '',
				nickname: '',
				role: '',
				permissions: []
			},
			travel: {
				id: '',
				title: '',
				content: '',
				images: [],
				video: '',
				userId: '',
				nickname: '',
				avatarUrl: '',
				status: 0,
				rejectReason: '',
				viewCount: 0,
				likeCount: 0,
				commentCount: 0,
				createTime: '',
				updateTime: ''
			},
			showRejectDialog: false,
			rejectReason: ''
		}
	},
	onLoad(options) {
		if (options.id) {
			this.id = options.id;
			this.checkLogin();
		} else {
			uni.showToast({
				title: '参数错误',
				icon: 'none'
			});
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		}
	},
	methods: {
		checkLogin() {
			const userInfo = uni.getStorageSync('userInfo');
			if (!userInfo) {
				uni.redirectTo({
					url: '/pages/login/login'
				});
				return;
			}
			
			this.userInfo = userInfo;
			this.loadTravelDetail();
		},
		
		loadTravelDetail() {
			this.loading = true;
			
			// 模拟API调用，实际项目中应该调用后端接口
			setTimeout(() => {
				// 根据接口文档模拟数据
				this.travel = this.getMockData();
				this.loading = false;
			}, 500);
		},
		
		// 模拟数据
		getMockData() {
			const mockDetails = {
				'1': {
					id: '1',
					title: '成都两日游',
					content: '成都是一座来了就不想走的城市，这里有美食、熊猫和休闲的生活方式。第一天我们去了宽窄巷子，感受了成都的慢生活；第二天去了大熊猫繁育研究基地，看到了可爱的国宝熊猫。成都的火锅也非常好吃，推荐大家一定要尝试当地的特色小吃。',
					images: [
						'/static/jzg.jpeg',
						'/static/gsc.png',
						'/static/ddbyc.jpg'
					],
					video: '',
					userId: 'user1',
					nickname: '旅行者小明',
					avatarUrl: '/static/img/default-avatar.svg',
					status: 0, // 待审核
					rejectReason: '',
					viewCount: 103,
					likeCount: 25,
					commentCount: 8,
					createTime: '2023-02-15T08:30:00Z',
					updateTime: '2023-02-15T08:30:00Z'
				},
				'2': {
					id: '2',
					title: '杭州西湖一日游',
					content: '西湖真美，太美了！我们沿着苏堤散步，看到了断桥残雪的美景。西湖十景果然名不虚传，特别是雷峰塔和三潭印月，美得让人窒息。午餐在知味观吃了正宗的杭帮菜，味道不错。下午坐游船游览了西湖，黄昏时分的西湖别有一番韵味。',
					images: [
						'/static/xh.jpg',
						'/static/tt.jpg'
					],
					video: '',
					userId: 'user2',
					nickname: '旅行者小红',
					avatarUrl: '/static/img/default-avatar.svg',
					status: 1, // 已通过
					rejectReason: '',
					viewCount: 87,
					likeCount: 16,
					commentCount: 5,
					createTime: '2023-03-20T10:15:00Z',
					updateTime: '2023-03-20T10:15:00Z'
				},
				'3': {
					id: '3',
					title: '北京故宫游记',
					content: '故宫是我国历史文化的瑰宝，有着悠久的历史和丰富的文化内涵。我们从午门进入，依次参观了太和殿、中和殿和保和殿。宫殿的建筑雄伟壮观，令人叹为观止。后来还去了珍宝馆，看到了许多珍贵的历史文物。',
					images: [
						'/static/gg.jpeg',
						'/static/bmy.jpeg'
					],
					video: '',
					userId: 'user3',
					nickname: '旅行者小李',
					avatarUrl: '/static/img/default-avatar.svg',
					status: 2, // 未通过
					rejectReason: '内容质量不高，请增加更多实际体验和照片。',
					viewCount: 156,
					likeCount: 42,
					commentCount: 0,
					createTime: '2023-04-10T14:20:00Z',
					updateTime: '2023-04-10T14:20:00Z'
				},
				'4': {
					id: '4',
					title: '黄山三日游',
					content: '黄山的云海和奇松真是美不胜收！我们在山顶看日出，云海在脚下翻腾，金色的阳光洒在云层上，如同仙境一般。黄山的松树形态各异，有的如伞盖，有的如龙形，别具一格。山间的温泉也是一大享受，在寒冷的山区泡一泡暖暖的温泉，疲惫一扫而空。',
					images: [
						'/static/hs.jpeg'
					],
					video: '',
					userId: 'user4',
					nickname: '旅行者小王',
					avatarUrl: '/static/img/default-avatar.svg',
					status: 0, // 待审核
					rejectReason: '',
					viewCount: 213,
					likeCount: 56,
					commentCount: 12,
					createTime: '2023-05-18T11:45:00Z',
					updateTime: '2023-05-18T11:45:00Z'
				},
				'5': {
					id: '5',
					title: '青海湖环湖游',
					content: '青海湖是中国最大的内陆湖泊，湖水碧蓝，远处是巍峨的雪山，沿岸是广阔的草原。我们骑行环湖，领略了不同角度的湖景。油菜花盛开的季节，金色的花海与蓝色的湖水形成鲜明对比，美不胜收。傍晚时分，夕阳西下，湖面波光粼粼，为这次旅行画上了完美的句号。',
					images: [
						'/static/qt.jpg'
					],
					video: '',
					userId: 'user5',
					nickname: '旅行者小张',
					avatarUrl: '/static/img/default-avatar.svg',
					status: 1, // 已通过
					rejectReason: '',
					viewCount: 145,
					likeCount: 38,
					commentCount: 7,
					createTime: '2023-06-10T14:20:00Z',
					updateTime: '2023-06-10T14:20:00Z'
				}
			};
			
			return mockDetails[this.id] || {};
		},
		
		formatTime(timeStr) {
			try {
				const date = new Date(timeStr);
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
			} catch (e) {
				return timeStr;
			}
		},
		
		getStatusClass(status) {
			switch (Number(status)) {
				case 0: return 'status-pending';
				case 1: return 'status-approved';
				case 2: return 'status-rejected';
				default: return '';
			}
		},
		
		getStatusText(status) {
			switch (Number(status)) {
				case 0: return '待审核';
				case 1: return '已通过';
				case 2: return '未通过';
				default: return '未知';
			}
		},
		
		previewImage(index) {
			uni.previewImage({
				urls: this.travel.images,
				current: this.travel.images[index]
			});
		},
		
		// 检查是否有权限执行操作
		hasPermission(action) {
			return this.userInfo.permissions && this.userInfo.permissions.includes(action);
		},
		
		handleApprove() {
			// 检查权限
			if (!this.hasPermission('approve')) {
				uni.showToast({
					title: '您没有审核权限',
					icon: 'none'
				});
				return;
			}
			
			uni.showModal({
				title: '确认',
				content: `确定通过游记"${this.travel.title}"？`,
				success: (res) => {
					if (res.confirm) {
						// 模拟API调用
						setTimeout(() => {
							// 更新本地数据
							this.travel.status = 1;
							
							uni.showToast({
								title: '审核通过成功',
								icon: 'success'
							});
						}, 500);
					}
				}
			});
		},
		
		handleReject() {
			// 检查权限
			if (!this.hasPermission('reject')) {
				uni.showToast({
					title: '您没有审核权限',
					icon: 'none'
				});
				return;
			}
			
			this.rejectReason = '';
			this.showRejectDialog = true;
		},
		
		cancelReject() {
			this.showRejectDialog = false;
			this.rejectReason = '';
		},
		
		confirmReject() {
			if (!this.rejectReason.trim()) {
				uni.showToast({
					title: '请输入拒绝原因',
					icon: 'none'
				});
				return;
			}
			
			// 模拟API调用
			setTimeout(() => {
				// 更新本地数据
				this.travel.status = 2;
				this.travel.rejectReason = this.rejectReason;
				
				this.showRejectDialog = false;
				
				uni.showToast({
					title: '已拒绝',
					icon: 'success'
				});
			}, 500);
		},
		
		handleDelete() {
			// 检查权限
			if (!this.hasPermission('delete')) {
				uni.showToast({
					title: '您没有删除权限',
					icon: 'none'
				});
				return;
			}
			
			uni.showModal({
				title: '确认删除',
				content: `确定要删除游记"${this.travel.title}"吗？`,
				success: (res) => {
					if (res.confirm) {
						// 模拟API调用
						setTimeout(() => {
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
							
							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
						}, 500);
					}
				}
			});
		},
		
		goBack() {
			uni.navigateBack();
		}
	}
}
</script>

<style>
.detail-container {
	padding: 20px;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.loading {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 200px;
	color: #909399;
}

.detail-content {
	background-color: #fff;
	border-radius: 8px;
	padding: 20px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header {
	margin-bottom: 20px;
	padding-bottom: 15px;
	border-bottom: 1px solid #ebeef5;
}

.title-box {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15px;
}

.title {
	font-size: 22px;
	font-weight: bold;
	color: #303133;
	flex: 1;
}

.status-tag {
	padding: 4px 10px;
	border-radius: 4px;
	font-size: 12px;
}

.status-pending {
	background-color: #e6a23c;
	color: #fff;
}

.status-approved {
	background-color: #67c23a;
	color: #fff;
}

.status-rejected {
	background-color: #f56c6c;
	color: #fff;
}

.author-info {
	display: flex;
	align-items: center;
}

.avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	margin-right: 10px;
}

.author-details {
	display: flex;
	flex-direction: column;
}

.nickname {
	font-size: 16px;
	color: #303133;
	font-weight: 500;
}

.time {
	font-size: 12px;
	color: #909399;
	margin-top: 4px;
}

.content {
	margin-bottom: 30px;
}

.content-text {
	font-size: 16px;
	color: #606266;
	line-height: 1.8;
	white-space: pre-wrap;
	margin-bottom: 20px;
}

.image-grid {
	display: flex;
	flex-wrap: wrap;
	margin: 0 -5px;
}

.image-item {
	width: 33.33%;
	padding: 5px;
	box-sizing: border-box;
}

.image-item image {
	width: 100%;
	height: 100px;
	border-radius: 4px;
	object-fit: cover;
}

.video-container {
	margin-top: 20px;
}

.video-container video {
	width: 100%;
	height: 200px;
	border-radius: 4px;
}

.stats-section {
	display: flex;
	margin-bottom: 20px;
	padding: 15px 0;
	border-top: 1px solid #ebeef5;
	border-bottom: 1px solid #ebeef5;
}

.stat-item {
	display: flex;
	align-items: center;
	margin-right: 30px;
}

.stat-icon {
	font-size: 18px;
	margin-right: 5px;
}

.stat-value {
	font-size: 16px;
	color: #606266;
}

.reject-reason {
	margin: 20px 0;
	padding: 15px;
	background-color: #fdf6ec;
	border-radius: 4px;
}

.reason-title {
	font-weight: bold;
	color: #e6a23c;
	margin-bottom: 5px;
	display: block;
}

.reason-content {
	color: #606266;
	line-height: 1.6;
}

.action-section {
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	margin-top: 30px;
}

.action-btn {
	min-width: 120px;
	padding: 10px 20px;
	border-radius: 4px;
	font-size: 16px;
	margin: 0 10px 10px;
}

.approve {
	background-color: #67c23a;
	color: white;
}

.reject {
	background-color: #f56c6c;
	color: white;
}

.delete {
	background-color: #909399;
	color: white;
}

.back {
	background-color: #409eff;
	color: white;
}

/* 弹窗样式 */
.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 999;
}

.modal-container {
	width: 80%;
	max-width: 500px;
	background-color: #fff;
	border-radius: 8px;
	padding: 20px;
}

.modal-title {
	font-size: 18px;
	color: #303133;
	margin-bottom: 20px;
	font-weight: bold;
	text-align: center;
}

.modal-input {
	width: 100%;
	height: 100px;
	padding: 10px;
	box-sizing: border-box;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	margin-bottom: 20px;
}

.modal-footer {
	display: flex;
	justify-content: flex-end;
}

.modal-btn {
	padding: 6px 20px;
	border-radius: 4px;
	font-size: 14px;
	margin-left: 10px;
}

.modal-btn.cancel {
	background-color: #f2f6fc;
	border: 1px solid #dcdfe6;
	color: #606266;
}

.modal-btn.confirm {
	background-color: #f56c6c;
	color: white;
	border: none;
}
</style> 