// Approval workflow configuration
const APPROVAL_WORKFLOW = [
    {
        stage: 'Faculty',
        officeName: 'Faculty',
        order: 1,
        required: true
    },
    {
        stage: 'ClassCoordinator',
        officeName: 'Class Coordinator',
        order: 2,
        required: true
    },
    {
        stage: 'HOD',
        officeName: 'HOD',
        order: 3,
        required: true
    },
    {
        stage: 'HostelWarden',
        officeName: 'Hostel Administration',
        order: 4,
        required: false, // Only if hostel involved
        condition: 'hostelInvolved'
    },
    {
        stage: 'LibraryAdmin',
        officeName: 'Library',
        order: 5,
        required: true
    },
    {
        stage: 'WorkshopAdmin',
        officeName: 'Workshop/Lab',
        order: 6,
        required: true
    },
    {
        stage: 'TPOfficer',
        officeName: 'Training & Placement Cell',
        order: 7,
        required: true
    },
    {
        stage: 'GeneralOffice',
        officeName: 'General Office',
        order: 8,
        required: true
    },
    {
        stage: 'AccountsOfficer',
        officeName: 'Accounts Office',
        order: 9,
        required: true,
        isFinal: true
    }
];

// Get next stage in workflow
const getNextStage = (currentStage, hostelInvolved = false) => {
    const currentIndex = APPROVAL_WORKFLOW.findIndex(s => s.stage === currentStage);

    if (currentIndex === -1) return null;

    // Find next required stage
    for (let i = currentIndex + 1; i < APPROVAL_WORKFLOW.length; i++) {
        const stage = APPROVAL_WORKFLOW[i];

        // Check if stage is required
        if (stage.required) {
            return stage.stage;
        }

        // Check conditional stages
        if (stage.condition === 'hostelInvolved' && hostelInvolved) {
            return stage.stage;
        }
    }

    return 'completed';
};

// Get previous stage
const getPreviousStage = (currentStage, hostelInvolved = false) => {
    const currentIndex = APPROVAL_WORKFLOW.findIndex(s => s.stage === currentStage);

    if (currentIndex === -1 || currentIndex === 0) return null;

    // Find previous required stage
    for (let i = currentIndex - 1; i >= 0; i--) {
        const stage = APPROVAL_WORKFLOW[i];

        if (stage.required) {
            return stage.stage;
        }

        if (stage.condition === 'hostelInvolved' && hostelInvolved) {
            return stage.stage;
        }
    }

    return null;
};

// Check if stage is final
const isFinalStage = (stage) => {
    const stageConfig = APPROVAL_WORKFLOW.find(s => s.stage === stage);
    return stageConfig?.isFinal || false;
};

// Get stage info
const getStageInfo = (stage) => {
    return APPROVAL_WORKFLOW.find(s => s.stage === stage);
};

// Get all stages for application
const getApplicableStages = (hostelInvolved = false) => {
    return APPROVAL_WORKFLOW.filter(stage => {
        if (stage.required) return true;
        if (stage.condition === 'hostelInvolved') return hostelInvolved;
        return false;
    });
};

module.exports = {
    APPROVAL_WORKFLOW,
    getNextStage,
    getPreviousStage,
    isFinalStage,
    getStageInfo,
    getApplicableStages
};
