import type { IModerationReport, IModerationAudit } from '@rocket.chat/core-typings';
import type { UpdateResult, Document } from 'mongodb';

import type { PaginatedResult } from '../../helpers/PaginatedResult';
import type { ArchiveReportProps } from './ArchiveReportProps';
import type { ReportHistoryProps } from './ReportHistoryProps';

export type ModerationEndpoints = {
	// API endpoint to fetch the reported messages
	'/v1/moderation.getReports': {
		GET: (params: ReportHistoryProps) => PaginatedResult<{
			reports: IModerationAudit[];
			count: number;
			offset: number;
			total: number;
		}>;
	};
	'/v1/moderation.user.getMessageHistory': {
		GET: (params: { userId: string; sort?: string; selector?: string; count?: number }) => PaginatedResult<{
			messages: Pick<IModerationReport, 'message' | 'ts' | 'room' | '_id'>[];
		}>;
	};
	'/v1/moderation.user.deleteMessageHistory': {
		POST: (params: { userId: string; reasonForHiding?: string }) => void;
	};
	'/v1/moderation.markChecked': {
		POST: (params: ArchiveReportProps) => {
			update: Document | UpdateResult;
		};
	};
	'/v1/moderation.reportsByMessage': {
		GET: (params: { msgId: string; sort?: string; selector?: string; count?: number }) => PaginatedResult<{
			reports: Pick<IModerationReport, '_id' | 'description' | 'reportedBy' | 'ts' | 'room'>[];
		}>;
	};
	'/v1/moderation.getReportInfo': {
		GET: (params: { reportId: string }) => {
			report: IModerationReport | null;
		};
	};
};
