import { Injectable, NotFoundException } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { genSalt, hash } from 'bcryptjs'
import { InjectModel } from 'nestjs-typegoose'
import { Types } from 'mongoose'
import { UpdateProfileDto } from './dto/updateProfile.dto'
import { UserModel } from './user.model'

@Injectable()
export class UserService {
	constructor(
		@InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>
	) {}

	async getOne(_id: string) {
		const user = await this.UserModel.findById(_id)
		if (!user) throw new NotFoundException('User not found')

		return user
	}

	async update(_id: string, dto: UpdateProfileDto) {
		const user = await this.getOne(_id)
		const isSameUser = await this.UserModel.findOne({ email: dto.email })

		if (isSameUser && String(_id) !== String(isSameUser._id))
			throw new NotFoundException('Email busy')

		if (dto.password) {
			const salt = await genSalt(12)
			user.password = await hash(dto.password, salt)
		}

		user.email = dto.email

		if (dto.isAdmin || dto.isAdmin === false) {
			user.isAdmin = dto.isAdmin
		}

		await user.save()

		return user
	}

	async getCount() {
		return this.UserModel.find().count().exec()
	}

	async getAll(searchTerm?: string) {
		let options = {}

		if (searchTerm)
			options = {
				$or: [
					{
						email: new RegExp(searchTerm, 'i'),
					},
				],
			}

		return this.UserModel.find(options)
			.select('-password -updatedAt -__v')
			.sort({
				createdAt: 'desc',
			})
			.exec()
	}

	async delete(id: string) {
		return this.UserModel.findByIdAndDelete(id)
	}

	async toggleFavorite(movieId: Types.ObjectId, { _id, favorites }: UserModel) {
		return this.UserModel.findByIdAndUpdate(_id, {
			favorites: favorites.includes(movieId)
				? favorites.filter((id) => String(id) !== String(movieId))
				: [...favorites, movieId],
		})
	}

	async getFavoriteMovies(_id: Types.ObjectId) {
		return this.UserModel.findById(_id, 'favorites')
			.populate({
				path: 'favorites',
				populate: {
					path: 'genres',
				},
			})
			.exec()
			.then((data) => data.favorites)
	}
}
