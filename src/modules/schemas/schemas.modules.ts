import {
  Agreement,
  AgreementSchema,
} from '../routes/v1/agreements/schemas/agreement.schema';
import {
  Answer,
  AnswerSchema,
} from '../routes/v2/answers/schemas/answer.schema';
import {
  Assessment,
  AssessmentSchema,
} from '../routes/v2/assessments/schemas/assessment.schema';
import {
  AssessmentCycle,
  AssessmentCycleSchema,
} from '../routes/v1/assessmentCycles/assessmentCycle.schema';
import {
  AssessmentType,
  AssessmentTypeSchema,
} from '../routes/v1/assessmentTypes/schemas/assessmentType.schema';
import {
  Bookmark,
  BookmarkSchema,
} from '../routes/v2/bookmarks/schemas/bookmark.schema';
import {
  ClientUnit,
  ClientUnitSchema,
} from '../routes/v1/clientUnits/schemas/clientUnit.schema';
import {
  Country,
  CountrySchema,
} from '../routes/v1/countries/schemas/countries.schema';
import { Doc, DocSchema } from '../routes/v1/docs/schemas/doc.schema';
import {
  Document,
  DocumentSchema,
} from '../routes/v1/documents/schemas/document.schema';
import {
  DocumentVariableGroup,
  DocumentVariableGroupSchema,
} from '../routes/v1/documentVariableGroups/schemas/documentVariableGroups.schema';
import {
  Domain,
  DomainSchema,
} from '../routes/v2/domains/schemas/domain.schema';
import { File, FileSchema } from '../routes/v1/files/schemas/files.schema';
import {
  Finding,
  FindingSchema,
} from '../routes/v2/findings/schemas/finding.schema';
import {
  Folder,
  FolderSchema,
} from '../routes/v2/folders/schemas/folder.schema';
import { Group, GroupSchema } from '../routes/v2/groups/schemas/group.schema';
import {
  KeyConcept,
  KeyConceptSchema,
} from '../routes/v2/keyConcepts/schemas/keyConcept.schema';
import { Log, LogSchema } from '../routes/v2/logs/schemas/log.schema';
import { Note, NoteSchema } from '../routes/v2/notes/schemas/note.schema';
import {
  PdfFolder,
  PdfFolderSchema,
} from '../routes/v2/pdfFolders/schemas/pdfFolder.schema';
import {
  Policy,
  PolicySchema,
} from '../routes/v2/policies/schemas/policy.schema';
import { Quiz, QuizSchema } from '../routes/v2/quizzes/schemas/quiz.schema';
import { Role, RoleSchema } from '../routes/v1/roles/schemas/roles.schema';
import {
  ScreenRecorder,
  ScreenRecorderSchema,
} from '../routes/v2/screenRecorders/schemas/screenRecorder.schema';
import {
  Setting,
  SettingSchema,
} from '../routes/v2/settings/schemas/setting.schema';
import {
  SimDoc,
  SimDocSchema,
} from '../routes/v1/simDocs/schemas/simDoc.schema';
import {
  Simulation,
  SimulationSchema,
} from '../routes/v1/simulations/schemas/simulation.schema';
import {
  SimulationAnnouncementTemplate,
  SimulationAnnouncementTemplateSchema,
} from '../routes/v1/simulationAnnouncementTemplates/schemas/simulationAnnouncementTemplate.schema';
import {
  SimulationMapper,
  SimulationMapperSchema,
} from '../routes/v3/simulationMapper/schemas/simulationMapper.schema';
import {
  Subject,
  SubjectSchema,
} from '../routes/v1/subjects/schemas/subject.schema';
import {
  SystemSetting,
  SystemSettingSchema,
} from '../routes/v1/systemSettings/schemas/systemSetting.schema';
import {
  Template,
  TemplateSchema,
} from '../routes/v1/templates/schemas/template.schema';
import {
  Training,
  TrainingSchema,
} from '../routes/v2/trainings/schemas/training.schema';
import {
  TrainingLog,
  TrainingLogSchema,
} from '../routes/v2/trainingLogs/schemas/trainingLogs.schema';
import {
  TrainingResource,
  TrainingResourceSchema,
} from '../routes/v1/trainingResources/schemas/trainingResources.schema';
import {
  Tutorial,
  TutorialSchema,
} from '../routes/v2/tutorials/schemas/tutorial.schema';
import { User, UserSchema } from '../routes/v1/users/schemas/users.schema';
import {
  UserAssessmentCycle,
  UserAssessmentCycleSchema,
} from '../routes/v1/userAssessmentCycles/schemas/userAssessmentCycle.schema';
import {
  UserAssessmentCycleSummary,
  UserAssessmentCycleSummarySchema,
} from '../routes/v1/userAssessmentCycles/schemas/userAssessmentCycleSummary.schema';
import {
  UserSimulation,
  UserSimulationSchema,
} from '../routes/v2/userSimulations/schemas/userSimulation.schema';
import {
  UserTraining,
  UserTrainingSchema,
} from '../routes/v2/userTrainings/schemas/userTraining.schema';
import {
  Vendor,
  VendorSchema,
} from '../routes/v2/vendors/schemas/vendor.schema';
import { Video, VideoSchema } from '../routes/v2/videos/schemas/video.schema';
import {
  Viewport,
  ViewportSchema,
} from '../routes/v2/viewports/schemas/viewport.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Page } from '../routes/v1/pages/schemas/page.schema';
import { PageSchema } from '../routes/v1/pages/schemas/page.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      // v1
      { name: Agreement.name, schema: AgreementSchema },
      { name: AssessmentCycle.name, schema: AssessmentCycleSchema },
      { name: AssessmentType.name, schema: AssessmentTypeSchema },
      { name: ClientUnit.name, schema: ClientUnitSchema },
      { name: Country.name, schema: CountrySchema },
      { name: Doc.name, schema: DocSchema },
      { name: Document.name, schema: DocumentSchema },
      { name: DocumentVariableGroup.name, schema: DocumentVariableGroupSchema },
      { name: File.name, schema: FileSchema },
      { name: Page.name, schema: PageSchema },
      { name: Role.name, schema: RoleSchema },
      { name: SimDoc.name, schema: SimDocSchema },
      {
        name: SimulationAnnouncementTemplate.name,
        schema: SimulationAnnouncementTemplateSchema,
      },
      { name: Simulation.name, schema: SimulationSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: SystemSetting.name, schema: SystemSettingSchema },
      { name: Template.name, schema: TemplateSchema },
      { name: TrainingResource.name, schema: TrainingResourceSchema },
      { name: UserAssessmentCycle.name, schema: UserAssessmentCycleSchema },
      {
        name: UserAssessmentCycleSummary.name,
        schema: UserAssessmentCycleSummarySchema,
      },
      { name: User.name, schema: UserSchema },
      // v2
      { name: Answer.name, schema: AnswerSchema },
      { name: Assessment.name, schema: AssessmentSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: Domain.name, schema: DomainSchema },
      { name: Finding.name, schema: FindingSchema },
      { name: Folder.name, schema: FolderSchema },
      { name: Group.name, schema: GroupSchema },
      { name: KeyConcept.name, schema: KeyConceptSchema },
      { name: Log.name, schema: LogSchema },
      { name: Note.name, schema: NoteSchema },
      { name: PdfFolder.name, schema: PdfFolderSchema },
      { name: Policy.name, schema: PolicySchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: ScreenRecorder.name, schema: ScreenRecorderSchema },
      { name: Setting.name, schema: SettingSchema },
      { name: TrainingLog.name, schema: TrainingLogSchema },
      { name: Training.name, schema: TrainingSchema },
      { name: Tutorial.name, schema: TutorialSchema },
      { name: UserSimulation.name, schema: UserSimulationSchema },
      { name: UserTraining.name, schema: UserTrainingSchema },
      { name: Vendor.name, schema: VendorSchema },
      { name: Video.name, schema: VideoSchema },
      { name: Viewport.name, schema: ViewportSchema },
      // v3
      { name: SimulationMapper.name, schema: SimulationMapperSchema },
    ]),
  ],
  exports: [MongooseModule.forFeature([])],
})
export class SchemasModule {}
