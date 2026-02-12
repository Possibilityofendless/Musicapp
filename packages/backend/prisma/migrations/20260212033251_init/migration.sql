-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "audioPath" TEXT,
    "duration" DOUBLE PRECISION NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'landscape',
    "clipSeconds" INTEGER NOT NULL DEFAULT 8,
    "soraModel" TEXT NOT NULL DEFAULT 'sora-2',
    "performanceDensity" DOUBLE PRECISION NOT NULL DEFAULT 0.4,
    "budgetCapUsd" DOUBLE PRECISION NOT NULL DEFAULT 25.0,
    "estimatedCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bible" JSONB,
    "referenceImageUrl" TEXT,
    "referenceAssetPath" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "appearanceCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Storyboard" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "beatGrid" JSONB,
    "sections" JSONB,
    "lyricsData" JSONB,
    "energyCurve" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Storyboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "startTime" DOUBLE PRECISION NOT NULL,
    "endTime" DOUBLE PRECISION NOT NULL,
    "duration" DOUBLE PRECISION,
    "sceneType" TEXT NOT NULL,
    "section" TEXT,
    "mood" JSONB,
    "characterIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prompt" TEXT NOT NULL,
    "soraSize" TEXT NOT NULL DEFAULT '1280x720',
    "lipSyncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lipSyncMethod" TEXT,
    "lyricExcerpt" TEXT,
    "lyricIndices" JSONB,
    "referenceImageUrl" TEXT,
    "vocalSegmentAssetId" TEXT,
    "mouthVisibilityScore" DOUBLE PRECISION,
    "mouthVisibilityRequired" BOOLEAN NOT NULL DEFAULT true,
    "selectedVersionId" TEXT,
    "estimatedCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SceneVersion" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "take" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "soraClipId" TEXT,
    "soraClipUrl" TEXT,
    "finalVideoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "characterConsistencyScore" DOUBLE PRECISION,
    "mouthVisibilityScore" DOUBLE PRECISION,
    "qualityScore" DOUBLE PRECISION,
    "userScore" DOUBLE PRECISION,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "selectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SceneVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocalSegment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sceneId" TEXT,
    "audioPath" TEXT NOT NULL,
    "audioUrl" TEXT,
    "format" TEXT NOT NULL DEFAULT 'mp3',
    "duration" DOUBLE PRECISION NOT NULL,
    "startTime" DOUBLE PRECISION NOT NULL,
    "endTime" DOUBLE PRECISION NOT NULL,
    "phonemes" JSONB,
    "words" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocalSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedVideo" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" DOUBLE PRECISION,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessingJob" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sceneId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "queueJobId" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "error" TEXT,
    "errorStackTrace" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" DOUBLE PRECISION,
    "resultData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiUsage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "soraCallsCount" INTEGER NOT NULL DEFAULT 0,
    "soraTokensUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "apiName" TEXT NOT NULL,
    "endpoint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Character_projectId_idx" ON "Character"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Storyboard_projectId_key" ON "Storyboard"("projectId");

-- CreateIndex
CREATE INDEX "Scene_projectId_idx" ON "Scene"("projectId");

-- CreateIndex
CREATE INDEX "Scene_order_idx" ON "Scene"("order");

-- CreateIndex
CREATE INDEX "SceneVersion_sceneId_idx" ON "SceneVersion"("sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "SceneVersion_sceneId_take_key" ON "SceneVersion"("sceneId", "take");

-- CreateIndex
CREATE INDEX "VocalSegment_projectId_idx" ON "VocalSegment"("projectId");

-- CreateIndex
CREATE INDEX "VocalSegment_sceneId_idx" ON "VocalSegment"("sceneId");

-- CreateIndex
CREATE INDEX "GeneratedVideo_projectId_idx" ON "GeneratedVideo"("projectId");

-- CreateIndex
CREATE INDEX "GeneratedVideo_type_idx" ON "GeneratedVideo"("type");

-- CreateIndex
CREATE INDEX "ProcessingJob_projectId_idx" ON "ProcessingJob"("projectId");

-- CreateIndex
CREATE INDEX "ProcessingJob_type_idx" ON "ProcessingJob"("type");

-- CreateIndex
CREATE INDEX "ProcessingJob_status_idx" ON "ProcessingJob"("status");

-- CreateIndex
CREATE INDEX "ApiUsage_projectId_idx" ON "ApiUsage"("projectId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storyboard" ADD CONSTRAINT "Storyboard_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneVersion" ADD CONSTRAINT "SceneVersion_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedVideo" ADD CONSTRAINT "GeneratedVideo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessingJob" ADD CONSTRAINT "ProcessingJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
