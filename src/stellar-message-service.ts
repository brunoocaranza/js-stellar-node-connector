import { StrKey, xdr } from '@stellar/stellar-base';
import { ok, err, Result } from 'neverthrow';
import { createSignature, verifySignature } from './crypto-helper';
import ScpEnvelope = xdr.ScpEnvelope;
import ScpStatement = xdr.ScpStatement;

export interface QuorumSetDTO {
	validators: string[];
	innerQuorumSets: QuorumSetDTO[];
	threshold: number;
}

export function verifyStatementXDRSignature(
	statementXDR: Buffer,
	peerId: Buffer,
	signature: Buffer,
	network: Buffer
): Result<boolean, Error> {
	try {
		const body = Buffer.concat([
			network,
			Buffer.from([0, 0, 0, 1]),
			statementXDR
		]);
		return ok(verifySignature(peerId, signature, body));
	} catch (error) {
		if (error instanceof Error) return err(error);
		else return err(new Error('Error verifying statement xdr signature'));
	}
}

export function createStatementXDRSignature(
	scpStatementXDR: Buffer,
	publicKey: Buffer,
	secretKey: Buffer,
	network: Buffer
): Result<Buffer, Error> {
	try {
		const body = Buffer.concat([
			network,
			Buffer.from([0, 0, 0, 1]),
			scpStatementXDR
		]);
		const secret = Buffer.concat([secretKey, publicKey]);
		return ok(createSignature(secret, body));
	} catch (error) {
		if (error instanceof Error) return err(error);
		else return err(new Error('Error creating statement xdr signature'));
	}
}

export function getPublicKeyStringFromBuffer(
	buffer: Buffer
): Result<string, Error> {
	try {
		return ok(StrKey.encodeEd25519PublicKey(buffer).toString());
	} catch (error) {
		if (error instanceof Error) return err(error);
		else return err(new Error('error parsing public key string from buffer'));
	}
}

export function createSCPEnvelopeSignature(
	scpStatement: ScpStatement,
	publicKey: Buffer,
	secretKey: Buffer,
	network: Buffer
): Result<Buffer, Error> {
	try {
		return createStatementXDRSignature(
			scpStatement.toXDR(),
			publicKey,
			secretKey,
			network
		);
	} catch (error) {
		if (error instanceof Error) return err(error);
		else return err(new Error('Error creating scp envelope signature'));
	}
}

export function verifySCPEnvelopeSignature(
	scpEnvelope: ScpEnvelope,
	network: Buffer
): Result<boolean, Error> {
	try {
		return verifyStatementXDRSignature(
			scpEnvelope.statement().toXDR(),
			scpEnvelope.statement().nodeId().value(),
			scpEnvelope.signature(),
			network
		);
	} catch (error) {
		if (error instanceof Error) return err(error);
		else return err(new Error('Error verifying scp envelope signature'));
	}
}

export function getQuorumSetFromMessage(
	scpQuorumSetMessage: xdr.ScpQuorumSet
): Result<QuorumSetDTO, Error> {
	try {
		return ok(getQuorumSetFromMessageRecursive(scpQuorumSetMessage));
	} catch (error) {
		if (error instanceof Error) return err(error);
		else return err(new Error('Error getting quorumSet from message'));
	}
}

function getQuorumSetFromMessageRecursive(
	scpQuorumSetMessage: xdr.ScpQuorumSet
): QuorumSetDTO {
	return {
		threshold: scpQuorumSetMessage.threshold(),
		validators: scpQuorumSetMessage
			.validators()
			.map((validator) => StrKey.encodeEd25519PublicKey(validator.value())),
		innerQuorumSets: scpQuorumSetMessage
			.innerSets()
			.map((innerSet) => getQuorumSetFromMessageRecursive(innerSet))
	};
}

export function getIpFromPeerAddress(
	peerAddress: xdr.PeerAddress
): Result<string, Error> {
	try {
		const peerAddressIp = peerAddress.ip().value();
		return ok(
			peerAddressIp[0] +
				'.' +
				peerAddressIp[1] +
				'.' +
				peerAddressIp[2] +
				'.' +
				peerAddressIp[3]
		);
	} catch (error) {
		if (error instanceof Error) return err(error);
		else return err(new Error('Error getting ip from peer address'));
	}
}
