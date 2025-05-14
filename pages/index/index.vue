<template>
	<view class="content">
		<!-- 欢迎横幅 -->
		<welcome-banner :stats="statsData"></welcome-banner>
		
		<view class="header">
			<view class="user-info">
				<text class="welcome">欢迎，{{userInfo.role === 'admin' ? '管理员' : '审核员'}} {{userInfo.username}}</text>
				<button class="logout-btn" @click="logout">退出登录</button>
			</view>
			<view class="filter-container">
				<view class="filter-title">状态筛选：</view>
				<view class="filter-options">
					<view :class="['filter-item', status === '' ? 'active' : '']" @click="filterByStatus('')">
						全部
					</view>
					<view :class="['filter-item', status === '0' ? 'active' : '']" @click="filterByStatus('0')">
						待审核
					</view>
					<view :class="['filter-item', status === '1' ? 'active' : '']" @click="filterByStatus('1')">
						已通过
					</view>
					<view :class="['filter-item', status === '2' ? 'active' : '']" @click="filterByStatus('2')">
						未通过
					</view>
				</view>
			</view>
		</view>
		
		<view class="travel-list">
			<view v-if="loading" class="loading">
				<text>加载中...</text>
			</view>
			<view v-else-if="travelList.length === 0" class="empty">
				<text>暂无数据</text>
			</view>
			<view v-else class="list-container">
				<view v-for="(item, index) in travelList" :key="index" class="travel-item">
					<view class="travel-card">
						<view class="travel-header">
							<image class="avatar" :src="item.avatarUrl || '/static/default-avatar.png'"></image>
							<view class="user-detail">
								<text class="nickname">{{item.nickname}}</text>
								<text class="time">{{formatTime(item.createTime)}}</text>
							</view>
							<view class="status-tag" :class="getStatusClass(item.status)">
								{{getStatusText(item.status)}}
							</view>
						</view>
						
						<view class="travel-body" @click="viewDetail(item.id)">
							<view class="travel-title">{{item.title}}</view>
							<image class="cover-image" :src="item.coverImage || '/static/default-cover.jpg'" mode="aspectFill"></image>
						</view>
						
						<view class="travel-footer">
							<view class="travel-stats">
								<text class="stat-item">浏览：{{item.viewCount || 0}}</text>
								<text class="stat-item">点赞：{{item.likeCount || 0}}</text>
							</view>
							
							<view class="travel-actions">
								<button v-if="item.status === 0 && hasPermission('approve')" class="action-btn approve" @click="handleApprove(item)">通过</button>
								<button v-if="item.status === 0 && hasPermission('reject')" class="action-btn reject" @click="handleReject(item)">拒绝</button>
								<button v-if="userInfo.role === 'admin' && hasPermission('delete')" class="action-btn delete" @click="handleDelete(item)">删除</button>
							</view>
						</view>
						
						<view v-if="item.status === 2 && item.rejectReason" class="reject-reason">
							<text class="reason-label">拒绝原因：</text>
							<text class="reason-text">{{item.rejectReason}}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 分页控制 -->
		<view class="pagination">
			<button :disabled="page <= 1" @click="prevPage" class="page-btn">上一页</button>
			<text class="page-info">第 {{page}} 页</text>
			<button :disabled="!hasMore" @click="nextPage" class="page-btn">下一页</button>
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
import WelcomeBanner from '../../components/WelcomeBanner.vue';

	export default {
	components: {
		WelcomeBanner
	},
		data() {
			return {
			userInfo: {
				username: '',
				nickname: '',
				role: '',
				permissions: []
			},
			loading: true,
			status: '', // 筛选状态：''=全部，'0'=待审核，'1'=已通过，'2'=未通过
			page: 1,
			pageSize: 10,
			hasMore: false,
			travelList: [],
			showRejectDialog: false,
			rejectReason: '',
			currentItem: null,
			statsData: {
				pending: 2,
				approved: 2,
				rejected: 1
			}
		}
	},
	onLoad() {
		this.checkLogin();
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
			this.loadTravelList();
		},
		
		async loadTravelList() {
			this.loading = true;
			
			// 模拟API调用，实际项目中应该调用后端接口
			setTimeout(() => {
				// 根据接口文档模拟数据
				const mockData = this.getMockData();
				
				// 根据status筛选
				let filteredData = mockData;
				if (this.status !== '') {
					filteredData = mockData.filter(item => item.status.toString() === this.status);
				}
				
				// 更新统计数据
				this.updateStatsData(mockData);
				
				// 模拟分页
				const start = (this.page - 1) * this.pageSize;
				const end = start + this.pageSize;
				this.travelList = filteredData.slice(start, end);
				this.hasMore = filteredData.length > end;
				
				this.loading = false;
			}, 500);
		},
		
		// 模拟数据
		getMockData() {
			return [
				{
					id: '1',
					title: '成都两日游',
					coverImage: '/static/jzg.jpeg',
					userId: 'user1',
					nickname: '旅行者小明',
					avatarUrl: '/static/img/default-avatar.svg',
					createTime: '2023-02-15T08:30:00Z',
					viewCount: 103,
					likeCount: 25,
					status: 0 // 待审核
				},
				{
					id: '2',
					title: '杭州西湖一日游',
					coverImage: '/static/xh.jpg',
					userId: 'user2',
					nickname: '旅行者小红',
					avatarUrl: '/static/img/default-avatar.svg',
					createTime: '2023-03-20T10:15:00Z',
					viewCount: 87,
					likeCount: 16,
					status: 1 // 已通过
				},
				{
					id: '3',
					title: '北京故宫游记',
					coverImage: '/static/gg.jpeg',
					userId: 'user3',
					nickname: '旅行者小李',
					avatarUrl: '/static/img/default-avatar.svg',
					createTime: '2023-04-10T14:20:00Z',
					viewCount: 156,
					likeCount: 42,
					status: 2, // 未通过
					rejectReason: '内容质量不高，请增加更多实际体验和照片。'
				},
				{
					id: '4',
					title: '黄山三日游',
					coverImage: '/static/hs.jpeg',
					userId: 'user4',
					nickname: '旅行者小王',
					avatarUrl: '/static/img/default-avatar.svg',
					createTime: '2023-05-18T11:45:00Z',
					viewCount: 213,
					likeCount: 56,
					status: 0 // 待审核
				},
				{
					id: '5',
					title: '青海湖环湖游',
					coverImage: '/static/qt.jpg',
					userId: 'user5',
					nickname: '旅行者小张',
					avatarUrl: '/static/img/default-avatar.svg',
					createTime: '2023-06-10T14:20:00Z',
					viewCount: 145,
					likeCount: 38,
					status: 1 // 已通过
				}
			];
		},
		
		// 更新统计数据
		updateStatsData(data) {
			if (!data || data.length === 0) return;
			
			const stats = {
				pending: 0,
				approved: 0,
				rejected: 0
			};
			
			data.forEach(item => {
				switch (Number(item.status)) {
					case 0:
						stats.pending++;
						break;
					case 1:
						stats.approved++;
						break;
					case 2:
						stats.rejected++;
						break;
				}
			});
			
			this.statsData = stats;
		},
		
		filterByStatus(status) {
			this.status = status;
			this.page = 1;
			this.loadTravelList();
		},
		
		prevPage() {
			if (this.page > 1) {
				this.page--;
				this.loadTravelList();
			}
		},
		
		nextPage() {
			if (this.hasMore) {
				this.page++;
				this.loadTravelList();
			}
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
		
		viewDetail(id) {
			uni.navigateTo({
				url: `/pages/detail/detail?id=${id}`
			});
		},
		
		// 检查是否有权限执行操作
		hasPermission(action) {
			return this.userInfo.permissions && this.userInfo.permissions.includes(action);
		},
		
		handleApprove(item) {
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
				content: `确定通过游记"${item.title}"？`,
				success: (res) => {
					if (res.confirm) {
						// 模拟API调用
						setTimeout(() => {
							// 更新本地数据
							this.travelList = this.travelList.map(travel => {
								if (travel.id === item.id) {
									return { ...travel, status: 1 };
								}
								return travel;
							});
							
							uni.showToast({
								title: '审核通过成功',
								icon: 'success'
							});
						}, 500);
					}
				}
			});
		},
		
		handleReject(item) {
			// 检查权限
			if (!this.hasPermission('reject')) {
				uni.showToast({
					title: '您没有审核权限',
					icon: 'none'
				});
				return;
			}
			
			this.currentItem = item;
			this.rejectReason = '';
			this.showRejectDialog = true;
		},
		
		cancelReject() {
			this.showRejectDialog = false;
			this.currentItem = null;
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
				this.travelList = this.travelList.map(travel => {
					if (travel.id === this.currentItem.id) {
						return { 
							...travel, 
							status: 2,
							rejectReason: this.rejectReason
						};
					}
					return travel;
				});
				
				this.showRejectDialog = false;
				this.currentItem = null;
				this.rejectReason = '';
				
				uni.showToast({
					title: '已拒绝',
					icon: 'success'
				});
			}, 500);
		},
		
		handleDelete(item) {
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
				content: `确定要删除游记"${item.title}"吗？`,
				success: (res) => {
					if (res.confirm) {
						// 模拟API调用
						setTimeout(() => {
							// 更新本地数据
							this.travelList = this.travelList.filter(travel => travel.id !== item.id);
							
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
						}, 500);
					}
				}
			});
		},
		
		logout() {
			uni.showModal({
				title: '提示',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						uni.removeStorageSync('userInfo');
						uni.reLaunch({
							url: '/pages/login/login'
						});
					}
				}
			});
		}
		}
	}
</script>

<style>
	.content {
		padding: 20px;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.header {
		background-color: #fff;
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 20px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
	}

	.user-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		border-bottom: 1px solid #eee;
		padding-bottom: 15px;
	}

	.welcome {
		font-size: 18px;
		color: #333;
		font-weight: bold;
	}

	.logout-btn {
		padding: 6px 15px;
		background-color: #f56c6c;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 14px;
	}

	.filter-container {
		display: flex;
		align-items: center;
	}

	.filter-title {
		font-size: 16px;
		color: #606266;
		margin-right: 15px;
	}

	.filter-options {
		display: flex;
		flex-wrap: wrap;
	}

	.filter-item {
		padding: 6px 15px;
		border: 1px solid #dcdfe6;
		margin-right: 10px;
		margin-bottom: 10px;
		border-radius: 4px;
		cursor: pointer;
		color: #606266;
		font-size: 14px;
	}

	.filter-item.active {
		background-color: #007AFF;
		color: #fff;
		border-color: #007AFF;
	}

	.loading, .empty {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 50px 0;
		color: #909399;
	}

	.travel-card {
		background-color: #fff;
		border-radius: 8px;
		padding: 15px;
		margin-bottom: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.travel-header {
		display: flex;
		align-items: center;
		margin-bottom: 15px;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		margin-right: 10px;
	}

	.user-detail {
		flex: 1;
	}

	.nickname {
		font-size: 16px;
		color: #303133;
		font-weight: 500;
		display: block;
	}

	.time {
		font-size: 12px;
		color: #909399;
	}

	.status-tag {
		padding: 2px 8px;
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

	.travel-body {
		margin-bottom: 15px;
		cursor: pointer;
	}

	.travel-title {
		font-size: 18px;
		color: #303133;
		font-weight: bold;
		margin-bottom: 10px;
	}

	.cover-image {
		width: 100%;
		height: 200px;
		border-radius: 8px;
	}

	.travel-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 10px;
		border-top: 1px solid #ebeef5;
	}

	.travel-stats {
		display: flex;
	}

	.stat-item {
		margin-right: 15px;
		font-size: 14px;
		color: #909399;
	}

	.travel-actions {
		display: flex;
	}

	.action-btn {
		padding: 5px 12px;
		border-radius: 4px;
		font-size: 14px;
		margin-left: 8px;
		border: none;
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

	.reject-reason {
		margin-top: 10px;
		background-color: #fdf6ec;
		padding: 10px;
		border-radius: 4px;
	}

	.reason-label {
		font-weight: bold;
		color: #e6a23c;
	}

	.reason-text {
		color: #606266;
	}

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 20px;
		padding: 15px;
	}

	.page-btn {
		min-width: 80px;
		padding: 6px 15px;
		background-color: #007AFF;
		color: white;
		border: none;
		border-radius: 4px;
	}

	.page-btn:disabled {
		background-color: #c0c4cc;
	}

	.page-info {
		margin: 0 15px;
		color: #606266;
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
