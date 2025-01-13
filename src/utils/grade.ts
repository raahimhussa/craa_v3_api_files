import { UserSimulationStatus, UserTrainingStatus } from './status';

import { BusinessCycle } from 'src/modules/routes/v1/clientUnits/schemas/clientUnit.schema';
import { UserSimulation } from 'src/modules/routes/v2/userSimulations/schemas/userSimulation.schema';
import { UserTraining } from 'src/modules/routes/v2/userTrainings/schemas/userTraining.schema';

export const getGrade = (
  userBaseline: UserSimulation,
  userTrainings: UserTraining[],
  userFollowups: UserSimulation[],
  businessCycle: BusinessCycle,
) => {
  if (
    !userBaseline?.status ||
    userBaseline?.status === UserSimulationStatus.HasNotAssigned ||
    userBaseline?.status === UserSimulationStatus.Assigned ||
    userBaseline?.status === UserSimulationStatus.InProgress
  )
    return '-';
  const assignedDomains = userTrainings
    .filter(
      (_userTraining) =>
        _userTraining.status !== UserTrainingStatus.HasNotAssigned,
    )
    .map((_userTraining) => _userTraining.domainId);
  const assignedFollowups = userFollowups.filter((_userFollowup) =>
    assignedDomains.includes(_userFollowup.domainId),
  );
  const pass: { domainId: string; domainPass: number }[] = [];
  assignedDomains.forEach((_domainId) => {
    //NOTE - 0: InProgress, 1: Baseline Pass, 2: FollowUp Pass with 10% improvement, 3: FollowUp Pass, 4: Failed with 10% improvement 5: Failed
    let domainPass = 5;

    const identifiedFindingsInBaseline =
      userBaseline?.results?.identifiedScoreByMainDomain?.find(
        (_identifiedScoreByMainDomain) =>
          _identifiedScoreByMainDomain.domainId === _domainId,
      );
    if (identifiedFindingsInBaseline === undefined) {
      domainPass = 0;
      return pass.push({ domainId: _domainId, domainPass });
    }
    const identifiedFindingsInFollowupScore = userFollowups
      .find((_userFollowup) => _userFollowup.domainId === _domainId)
      ?.results?.identifiedScoreByMainDomain?.find(
        (_identifiedScoreByMainDomain) =>
          _identifiedScoreByMainDomain.domainId === _domainId,
      );
    const baselineScore =
      identifiedFindingsInBaseline?.allFindings?.length === 0
        ? 0
        : identifiedFindingsInBaseline.identifiedFindings.length /
          identifiedFindingsInBaseline.allFindings.length;
    const followupScore =
      identifiedFindingsInFollowupScore?.allFindings?.length === 0
        ? 0
        : identifiedFindingsInFollowupScore?.identifiedFindings?.length! /
          identifiedFindingsInFollowupScore?.allFindings?.length!;

    if (
      baselineScore >
      businessCycle?.settingsByDomainIds?.find(
        (_settingsByDomainIds) => _settingsByDomainIds?.domainId === _domainId,
      )?.minScore!
    ) {
      domainPass = 1;
      return pass.push({ domainId: _domainId, domainPass });
    } else if (followupScore !== 0 && !followupScore) {
      domainPass = 0;
      return pass.push({ domainId: _domainId, domainPass });
    } else if (
      followupScore >
        businessCycle?.settingsByDomainIds?.find(
          (_settingsByDomainIds) =>
            _settingsByDomainIds?.domainId === _domainId,
        )?.minScore! &&
      followupScore >= baselineScore * 1.1
    ) {
      domainPass = 2;
      return pass.push({ domainId: _domainId, domainPass });
    } else if (
      followupScore >
      businessCycle?.settingsByDomainIds?.find(
        (_settingsByDomainIds) => _settingsByDomainIds?.domainId === _domainId,
      )?.minScore!
    ) {
      domainPass = 3;
      return pass.push({ domainId: _domainId, domainPass });
    } else if (followupScore >= baselineScore * 1.1) {
      domainPass = 4;
      return pass.push({ domainId: _domainId, domainPass });
    }
  });

  // 1: Pass I, 2: Pass II, 3: Pass with Notice I, 4: Pass with Notice II
  if (pass.find((_pass) => _pass.domainPass === 0)) return '-';
  if (
    pass.length ===
    pass.filter(
      (_pass) =>
        _pass.domainPass === 1 ||
        _pass.domainPass === 2 ||
        _pass.domainPass === 3,
    ).length
  )
    return 'Pass I';
  if (
    pass.filter((_pass) => _pass.domainPass === 1 || _pass.domainPass === 2)
      .length >= 3 ||
    pass.length ===
      pass.filter(
        (_pass) =>
          _pass.domainPass === 1 ||
          _pass.domainPass === 2 ||
          _pass.domainPass === 3 ||
          _pass.domainPass === 4,
      ).length
  )
    return 'Pass II';
  if (
    pass.filter((_pass) => _pass.domainPass === 4 || _pass.domainPass === 5)
      .length >= 3
  )
    return 'Pass with Notice II';

  // if (pass.filter((_pass) => _pass.domainPass === 5).length >= 1)
  //   return 'Pass with Notice I';

  return 'Pass with Notice I';
};
