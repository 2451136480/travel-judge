<template>
	<view class="welcome-banner">
		<view class="banner-content">
			<view class="banner-left">
				<view class="banner-title">欢迎使用旅游日记审核平台</view>
				<view class="banner-subtitle">{{subtitle}}</view>
				<view class="stats">
					<view class="stat-item">
						<text class="stat-number">{{stats.pending}}</text>
						<text class="stat-label">待审核</text>
					</view>
					<view class="stat-item">
						<text class="stat-number">{{stats.approved}}</text>
						<text class="stat-label">已通过</text>
					</view>
					<view class="stat-item">
						<text class="stat-number">{{stats.rejected}}</text>
						<text class="stat-label">已拒绝</text>
					</view>
				</view>
			</view>
			<view class="banner-right">
				<image class="banner-image" :src="bannerImage" mode="aspectFill"></image>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		subtitle: {
			type: String,
			default: '今日待处理游记较多，请及时审核'
		},
		stats: {
			type: Object,
			default() {
				return {
					pending: 0,
					approved: 0,
					rejected: 0
				};
			}
		},
		bannerImage: {
			type: String,
			default: '/static/gsc.png'
		}
	}
}
</script>

<style>
.welcome-banner {
	background: linear-gradient(135deg, #3a8ee6 0%, #409eff 100%);
	border-radius: 8px;
	padding: 20px;
	margin-bottom: 20px;
	color: #fff;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.banner-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.banner-left {
	flex: 1;
}

.banner-title {
	font-size: 22px;
	font-weight: bold;
	margin-bottom: 10px;
}

.banner-subtitle {
	font-size: 14px;
	opacity: 0.9;
	margin-bottom: 20px;
}

.stats {
	display: flex;
	gap: 30px;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stat-number {
	font-size: 24px;
	font-weight: bold;
	margin-bottom: 5px;
}

.stat-label {
	font-size: 12px;
	opacity: 0.9;
}

.banner-right {
	flex: 0 0 180px;
	margin-left: 20px;
}

.banner-image {
	width: 180px;
	height: 120px;
	border-radius: 8px;
	object-fit: cover;
	border: 2px solid rgba(255, 255, 255, 0.3);
}
</style> 