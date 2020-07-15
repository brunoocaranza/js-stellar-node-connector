import {QuorumSet} from "@stellarbeat/js-stellar-domain";

export class PeerNode {
    public ip: string;
    public port: number;
    public publicKey?: string;
    public ledgerVersion?: string;
    public overlayVersion?: string;
    public overlayMinVersion?: string;
    public networkId?: string;
    public versionStr?: string;
    public quorumSet?: QuorumSet;

    constructor(ip: string, port: number) {
        this.ip = ip;
        this.port = port;
    }

    get key() {
        return this.ip + ":" + this.port;
    }
}