"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserContactDto = exports.SetActiveWorkGroupDto = exports.AssignWorkGroupTopicsDto = exports.AddWorkGroupMemberDto = exports.UpdateWorkGroupDto = exports.CreateWorkGroupDto = void 0;
const class_validator_1 = require("class-validator");
class CreateWorkGroupDto {
    name;
    identifier;
    description;
    logoUrl;
    primaryColor;
}
exports.CreateWorkGroupDto = CreateWorkGroupDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWorkGroupDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWorkGroupDto.prototype, "identifier", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWorkGroupDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWorkGroupDto.prototype, "logoUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWorkGroupDto.prototype, "primaryColor", void 0);
class UpdateWorkGroupDto {
    name;
    description;
    logoUrl;
    primaryColor;
    isActive;
}
exports.UpdateWorkGroupDto = UpdateWorkGroupDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWorkGroupDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWorkGroupDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWorkGroupDto.prototype, "logoUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWorkGroupDto.prototype, "primaryColor", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateWorkGroupDto.prototype, "isActive", void 0);
class AddWorkGroupMemberDto {
    userId;
    roleInGroup;
}
exports.AddWorkGroupMemberDto = AddWorkGroupMemberDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AddWorkGroupMemberDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddWorkGroupMemberDto.prototype, "roleInGroup", void 0);
class AssignWorkGroupTopicsDto {
    categoryIds;
}
exports.AssignWorkGroupTopicsDto = AssignWorkGroupTopicsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], AssignWorkGroupTopicsDto.prototype, "categoryIds", void 0);
class SetActiveWorkGroupDto {
    workGroupId;
}
exports.SetActiveWorkGroupDto = SetActiveWorkGroupDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SetActiveWorkGroupDto.prototype, "workGroupId", void 0);
class UpdateUserContactDto {
    phone;
}
exports.UpdateUserContactDto = UpdateUserContactDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserContactDto.prototype, "phone", void 0);
//# sourceMappingURL=work-group.dto.js.map