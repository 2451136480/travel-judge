// MongoDB 连接配置

// MongoDB 连接字符串
const MONGODB_URI = 'mongodb://root:gstv5j94@travel-mongodb.ns-dp5bwsp7.svc:27017';

// 导出数据库连接信息
const dbConfig = {
	uri: MONGODB_URI,
	options: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		// 数据库名称
		dbName: 'travelDiary'
	}
};

export default dbConfig; 