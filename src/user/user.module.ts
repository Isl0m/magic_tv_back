import { Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'
import { ConfigModule } from '@nestjs/config'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { UserModel } from './user.model'

@Module({
	imports: [
		ConfigModule,
		TypegooseModule.forFeature([
			{
				typegooseClass: UserModel,
				schemaOptions: {
					collection: 'User',
				},
			},
		]),
	],
	controllers: [UserController],
	providers: [UserService],
})
export class UserModule {}
