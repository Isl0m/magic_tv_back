import { IsEmail, IsString, MinLength } from 'class-validator'

export class UpdateProfileDto {
	@IsEmail()
	email: string

	password?: string

	isAdmin?: boolean
}
