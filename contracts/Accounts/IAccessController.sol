// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IAccessController {
    event OwnerAdded(address newOwner);
    event OwnerRemoved(address removedOwner);
    event GuardianAdded(address newGuardian);
    event GuardianRemoved(address removedGuardian);
    event ProposalSubmitted(uint256 proposalId, bytes newSignerProposed, address proposer);
    event QuorumNotReached(uint256 proposalId, bytes newSignerProposed, uint256 approvalCount);
    event ProposalDiscarded(uint256 proposalId, address discardedBy);
    event ProposalTimelockChanged(uint256 newTimelock);

    function isOwner(address _address) external view returns (bool);

    function isGuardian(address _address) external view returns (bool);

    function addOwner(address _newOwner) external;

    function removeOwner(address _owner) external;

    function addGuardian(address _newGuardian) external;

    function removeGuardian(address _guardian) external;

    function changeProposalTimelock(uint256 _newTimelock) external;

    function getProposal(uint256 _proposalId)
        external
        view
        returns (
            bytes memory signerProposed_,
            uint256[2] memory pubKeyCoordinates,
            uint256 approvalCount_,
            address[] memory guardiansApproved_,
            bool resolved_,
            uint256 proposedAt_
        );

    function discardCurrentProposal() external;

    function guardianPropose(bytes calldata _credId, uint256[2] calldata pubKeyCoordinates) external;

    function guardianCosign() external;
}
