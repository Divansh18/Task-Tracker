import { CreateSubtaskDto } from './create-subtask.dto';
declare const UpdateSubtaskDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateSubtaskDto>>;
export declare class UpdateSubtaskDto extends UpdateSubtaskDto_base {
    isCompleted?: boolean;
}
export {};
