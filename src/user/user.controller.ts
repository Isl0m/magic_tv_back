import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Put,
	UsePipes,
	ValidationPipe,
	Query,
} from '@nestjs/common'
import { Types } from 'mongoose'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { User } from './decorators/user.decorator'
import { UpdateProfileDto } from './dto/updateProfile.dto'
import { UserService } from './user.service'
import { IdValidationPipe } from './pipes/id.validation.pipe'
import { UserModel } from './user.model'

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	@Auth()
	async getProfile(@User('_id') _id: string) {
		return this.userService.getOne(_id)
	}

	@UsePipes(new ValidationPipe())
	@Put('profile')
	@HttpCode(200)
	@Auth()
	async updateProfile(@User('_id') _id: string, @Body() dto: UpdateProfileDto) {
		return this.userService.update(_id, dto)
	}

	@Get('profile/favorites')
	@Auth()
	async getFavorites(@User('_id') _id: Types.ObjectId) {
		return this.userService.getFavoriteMovies(_id)
	}

	@Put('profile/favorites')
	@HttpCode(200)
	@Auth()
	async toggleFavorite(
		@Body('movieId', IdValidationPipe) movieId: Types.ObjectId,
		@User() user: UserModel
	) {
		return this.userService.toggleFavorite(movieId, user)
	}

	// Admin Place

	@Get('count')
	@Auth('admin')
	async getCount() {
		return this.userService.getCount()
	}

	@Get()
	@Auth('admin')
	async getAll(@Query('searchTerm') searchTerm?: string) {
		return this.userService.getAll(searchTerm)
	}

	@Get(':id')
	@Auth('admin')
	async getOne(@Param('id', IdValidationPipe) id: string) {
		return this.userService.getOne(id)
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(200)
	@Auth('admin')
	async update(
		@Param('id', IdValidationPipe) id: string,
		@Body() dto: UpdateProfileDto
	) {
		return this.userService.update(id, dto)
	}

	@Delete(':id')
	@HttpCode(200)
	@Auth('admin')
	async delete(@Param('id') id: string) {
		return this.userService.delete(id)
	}
}
