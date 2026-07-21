async function runTests() {
  await import('./testCodeArenaSemantics');
  await import('./testCodeLab');
  await import('./testCodeLabPlaceholders');
  await import('./testProfessionalMaturity');
  await import('./testQuestionBankValidation');
  await import('./testQuestionQuality');
  await import('./testAdaptiveLearning');
  await import('./testProfessorByteContext');
  await import('./testJourneyRecommendation');
  await import('./testRankingPresentation');
  const accountDeletionModule = await import('./testAccountDeletion');
  await accountDeletionModule.accountDeletionTests;
  const feedbackModule = await import('./testFeedbackCenter');
  await feedbackModule.feedbackCenterTests;
  const releaseModule = await import('./testReleaseReadiness');
  await releaseModule.releaseReadinessTests;

  console.log('All automated tests OK');
}

runTests().catch((error: unknown) => {
  throw error;
});
