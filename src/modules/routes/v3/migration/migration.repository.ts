import mongoose, { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  MongoQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import { AssessmentType } from '../../v1/assessmentTypes/schemas/assessmentType.schema';
import { Demo_User } from './schemas/users.schema';
import { Demo_UserSummary } from './schemas/usersSummary';
import { Demo_Finding } from './schemas/findings';
import { Demo_UserStatus } from './schemas/usersStatus';
import { Demo_UsersDemographic } from './schemas/usersDemographic';
import { Demo_SimUsersSummary } from './schemas/simUsersSummary';
import { Demo_SimUsersSummaryPfizer } from './schemas/simUsersSummaryPfizer';
import { Demo_Assessment } from './schemas/assessments';
import { Demo_UserStatusPfizer } from './schemas/usersStatusPfizer';
import { Demo_UsersScoreSummary } from './schemas/usersScoreSummary';
import { Demo_TrainingModule } from './schemas/trainingModules';
import { Demo_TrainingStatusSummary } from './schemas/trainingStatusSummary';
import { Demo_TrainingModulePage } from './schemas/trainingModulePages';
import { Demo_TrainingModuleScoreSummary } from './schemas/trainingModuleScoreSummary';
import { Demo_Client } from './schemas/clients';
import { Demo_SimUsersSummaryAbbvie } from './schemas/simUsersSummaryAbbvie';
import { Demo_SimUsersSummaryPharmOlam } from './schemas/simUsersSummaryPharmOlam';
import { Demo_UserStatusAbbvie } from './schemas/usersStatusAbbvie';
import { Demo_UserStatusPharmOlam } from './schemas/usersStatusPharmOlam';
import { Demo_UserSummaryPfizer } from './schemas/usersSummaryPfizer';
import { Demo_UserSummaryAbbvie } from './schemas/usersSummaryAbbvie';
import { Demo_UserSummaryPharmOlam } from './schemas/usersSummaryPharmOlam';
import { Demo_TempTimerLog } from './schemas/tempTimerLog';
import { Demo_DomainTips } from './schemas/domainTips';
import { Demo_SimUsersSummaryAllucent } from './schemas/simUsersSummaryAllucent';
import { Demo_SimUsersSummarySyneos } from './schemas/simUsersSummarySyneos';
import { Demo_UserSummaryAllucent } from './schemas/usersSummaryAllucent';
import { Demo_UserSummarySyneos } from './schemas/usersSummarySyneos';
import { Demo_UserStatusAllucent } from './schemas/usersStatusAllucent';
import { Demo_UserStatusSyneos } from './schemas/usersStatusSyneos';
import { Demo_SimulationSetting } from './schemas/simulationSettings';
import { Demo_FindingsSelected } from './schemas/findingsSelected';
import { Demo_Document } from './schemas/documents';
import { Demo_DocumentFolder } from './schemas/docuemntFolders';
import { Demo_ComplianceNotes } from './schemas/complianceNotes';
import { Demo_MonitoringNotes } from './schemas/monitoringNotes';
import { Demo_ScoringBehaviors } from './schemas/scoringBehaviors';
import { Demo_ScoringAdjudication } from './schemas/scoringAdjudication';

@Injectable()
export default class MigrationRepository {
  constructor(
    @InjectModel(Demo_User.name, 'demo_db')
    private usersModel: Model<Demo_User>,

    @InjectModel(Demo_UserStatus.name, 'demo_db')
    private userStatusModel: Model<Demo_UserStatus>,

    @InjectModel(Demo_UserStatusPfizer.name, 'demo_db')
    private userStatusPfizerModel: Model<Demo_UserStatusPfizer>,

    @InjectModel(Demo_UserStatusAbbvie.name, 'demo_db')
    private userStatusAbbvieModel: Model<Demo_UserStatusAbbvie>,

    @InjectModel(Demo_UserStatusPharmOlam.name, 'demo_db')
    private userStatusPharmOlamModel: Model<Demo_UserStatusPharmOlam>,

    @InjectModel(Demo_UserStatusAllucent.name, 'demo_db')
    private userStatusAllucentModel: Model<Demo_UserStatusAllucent>,

    @InjectModel(Demo_UserStatusSyneos.name, 'demo_db')
    private userStatusSyneosModel: Model<Demo_UserStatusSyneos>,

    @InjectModel(Demo_UsersDemographic.name, 'demo_db')
    private usersDemographicModel: Model<Demo_UsersDemographic>,

    @InjectModel(Demo_UsersScoreSummary.name, 'demo_db')
    private usersScoreSummaryModel: Model<Demo_UsersScoreSummary>,

    @InjectModel(Demo_Assessment.name, 'demo_db')
    private assessments: Model<Demo_Assessment>,

    @InjectModel(Demo_SimUsersSummary.name, 'demo_db')
    private simUsersSummary: Model<Demo_SimUsersSummary>,

    @InjectModel(Demo_SimUsersSummaryPfizer.name, 'demo_db')
    private simUsersSummaryPfizer: Model<Demo_SimUsersSummaryPfizer>,

    @InjectModel(Demo_SimUsersSummaryAbbvie.name, 'demo_db')
    private simUsersSummaryAbbvie: Model<Demo_SimUsersSummaryAbbvie>,

    @InjectModel(Demo_SimUsersSummaryPharmOlam.name, 'demo_db')
    private simUsersSummaryPharmOlam: Model<Demo_SimUsersSummaryPharmOlam>,

    @InjectModel(Demo_SimUsersSummaryAllucent.name, 'demo_db')
    private simUsersSummaryAllucent: Model<Demo_SimUsersSummaryAllucent>,

    @InjectModel(Demo_SimUsersSummarySyneos.name, 'demo_db')
    private simUsersSummarySyneos: Model<Demo_SimUsersSummarySyneos>,

    @InjectModel(Demo_UserSummary.name, 'demo_db')
    private usersSummaryModel: Model<Demo_UserSummary>,

    @InjectModel(Demo_UserSummaryPfizer.name, 'demo_db')
    private usersSummaryPfizerModel: Model<Demo_UserSummaryPfizer>,

    @InjectModel(Demo_UserSummaryAbbvie.name, 'demo_db')
    private usersSummaryAbbvieModel: Model<Demo_UserSummaryAbbvie>,

    @InjectModel(Demo_UserSummaryPharmOlam.name, 'demo_db')
    private usersSummaryPharmOlamModel: Model<Demo_UserSummaryPharmOlam>,

    @InjectModel(Demo_UserSummaryAllucent.name, 'demo_db')
    private usersSummaryAllucentModel: Model<Demo_UserSummaryAllucent>,

    @InjectModel(Demo_UserSummarySyneos.name, 'demo_db')
    private usersSummarySyneosModel: Model<Demo_UserSummarySyneos>,

    @InjectModel(Demo_Finding.name, 'demo_db')
    private findingsModel: Model<Demo_Finding>,

    @InjectModel(Demo_FindingsSelected.name, 'demo_db')
    private findingsSelectedModel: Model<Demo_FindingsSelected>,

    @InjectModel(Demo_SimulationSetting.name, 'demo_db')
    private simulationSettingsModel: Model<Demo_SimulationSetting>,

    @InjectModel(Demo_TempTimerLog.name, 'demo_db')
    private tempFindingLogModel: Model<Demo_Finding>,

    @InjectModel(Demo_TrainingModule.name, 'demo_db')
    private trainingModuleModel: Model<Demo_TrainingModule>,

    @InjectModel(Demo_TrainingModulePage.name, 'demo_db')
    private trainingModulePageModel: Model<Demo_TrainingModulePage>,

    @InjectModel(Demo_TrainingStatusSummary.name, 'demo_db')
    private trainingStatusSummaryModel: Model<Demo_TrainingStatusSummary>,

    @InjectModel(Demo_TrainingModuleScoreSummary.name, 'demo_db')
    private trainingModuleScoreSummaryModel: Model<Demo_TrainingModuleScoreSummary>,

    @InjectModel(Demo_Client.name, 'demo_db')
    private clientModel: Model<Demo_Client>,

    @InjectModel(Demo_DomainTips.name, 'demo_db')
    private domainTipsModel: Model<Demo_DomainTips>,

    @InjectModel(Demo_Document.name, 'demo_db')
    private documentModel: Model<Demo_Document>,

    @InjectModel(Demo_DocumentFolder.name, 'demo_db')
    private documentFolderModel: Model<Demo_DocumentFolder>,

    @InjectModel(Demo_ComplianceNotes.name, 'demo_db')
    private complianceNoteModel: Model<Demo_ComplianceNotes>,

    @InjectModel(Demo_MonitoringNotes.name, 'demo_db')
    private monitoringNoteModel: Model<Demo_MonitoringNotes>,

    @InjectModel(Demo_ScoringBehaviors.name, 'demo_db')
    private scoringBehaviorModel: Model<Demo_ScoringBehaviors>,

    @InjectModel(Demo_ScoringAdjudication.name, 'demo_db')
    private scoringAdjudicationModel: Model<Demo_ScoringAdjudication>,
  ) {}

  async getAllUsers() {
    return this.usersModel.aggregate([]).match({});
    // .skip(10).limit(10);
  }

  async getAllUsersSummary() {
    return this.usersSummaryModel.aggregate([]).match({});
  }

  async getAllUsersSummaryPfizer() {
    return this.usersSummaryPfizerModel.aggregate([]).match({});
  }

  async getAllUsersSummaryAbbvie() {
    return this.usersSummaryAbbvieModel.aggregate([]).match({});
  }

  async getAllUsersSummaryPharmOlam() {
    return this.usersSummaryPharmOlamModel.aggregate([]).match({});
  }

  async getAllUsersSummaryAllucent() {
    return this.usersSummaryAllucentModel.aggregate([]).match({});
  }

  async getAllUsersSummarySyneos() {
    return this.usersSummarySyneosModel.aggregate([]).match({});
  }

  async getAllUserStatus() {
    return this.userStatusModel.aggregate([]).match({});
  }

  async getAllUserStatusPfizer() {
    return this.userStatusPfizerModel.aggregate([]).match({});
  }

  async getAllUserStatusAbbvie() {
    return this.userStatusAbbvieModel.aggregate([]).match({});
  }

  async getAllUserStatusPharmOlam() {
    return this.userStatusPharmOlamModel.aggregate([]).match({});
  }

  async getAllUserStatusAllucent() {
    return this.userStatusAllucentModel.aggregate([]).match({});
  }

  async getAllUserStatusSyneos() {
    return this.userStatusSyneosModel.aggregate([]).match({});
  }

  async getAllUsersDemographic() {
    return this.usersDemographicModel.aggregate([]).match({});
  }

  async getAllUsersScoreSummary() {
    return this.usersScoreSummaryModel.aggregate([]).match({});
  }

  async getAllAssessments() {
    return this.assessments.aggregate([]).match({});
  }

  async getAllSimUsersSummary() {
    return this.simUsersSummary.aggregate([]).match({});
  }

  async getAllSimUsersSummaryPfizer() {
    return this.simUsersSummaryPfizer.aggregate([]).match({});
  }

  async getAllSimUsersSummaryAbbvie() {
    return this.simUsersSummaryAbbvie.aggregate([]).match({});
  }

  async getAllSimUsersSummaryPharmOlam() {
    return this.simUsersSummaryPharmOlam.aggregate([]).match({});
  }

  async getAllSimUsersSummaryAllucent() {
    return this.simUsersSummaryAllucent.aggregate([]).match({});
  }

  async getAllSimUsersSummarySyneos() {
    return this.simUsersSummarySyneos.aggregate([]).match({});
  }

  async getAllFindings() {
    return this.findingsModel.aggregate([]).match({});
  }

  async getAllFindingsSelected() {
    return this.findingsSelectedModel.aggregate([]).match({});
  }

  async getAllSimulationSettings() {
    return this.simulationSettingsModel.aggregate([]).match({});
  }

  async getAllTempFindingLog() {
    return this.tempFindingLogModel.aggregate([]).match({});
  }

  async getAllTrainingModules() {
    return this.trainingModuleModel.aggregate([]).match({});
  }

  async getAllTrainingModulePages() {
    return this.trainingModulePageModel.aggregate([]).match({});
  }

  async getAllTrainingStatusSummary() {
    return this.trainingStatusSummaryModel.aggregate([]).match({});
  }

  async getAllTrainingModuleScoreSummary() {
    return this.trainingModuleScoreSummaryModel.aggregate([]).match({});
  }

  async getAllClients() {
    return this.clientModel.aggregate([]).match({});
  }

  async getAllDomainTips() {
    return this.domainTipsModel.aggregate([]).match({});
  }

  async getAllDocuments() {
    return this.documentModel.aggregate([]).match({});
  }

  async getAllDocumentFolders() {
    return this.documentFolderModel.aggregate([]).match({});
  }

  async getAllComplianceNotes() {
    return this.complianceNoteModel.aggregate([]).match({});
  }

  async getComplianceNotesBySimulation(simulationId: string) {
    return this.complianceNoteModel
      .aggregate([
        {
          $match: {
            simulation_id: simulationId,
          },
        },
      ])
      .match({});
  }

  async getAllMonitoringNotes() {
    return this.monitoringNoteModel.aggregate([]).match({});
  }

  async getMonitoringNotesBySimulation(simulationId: string) {
    return this.monitoringNoteModel
      .aggregate([
        {
          $match: {
            simulation_id: simulationId,
          },
        },
      ])
      .match({});
  }

  async getAllScoringBehaviors() {
    return this.scoringBehaviorModel.aggregate([]).match({});
  }

  async getScoringBehaviorsBySimulation(simulationId: string) {
    return this.scoringBehaviorModel
      .aggregate([
        {
          $match: {
            simulation_id: simulationId,
          },
        },
      ])
      .match({});
  }

  async getAllScoringAdjudication() {
    return this.scoringAdjudicationModel.aggregate([]).match({});
  }
}
