-- Phase 7: Customer Helpdesk reporting, CSAT, audit, and Crescosoft escalation support.
-- Review table prefix before applying if DB prefix differs from cre_.

CREATE TABLE IF NOT EXISTS cre_customer_helpdesk_audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  org_id INT NOT NULL,
  ticketId INT NULL,
  actorType ENUM('employee','customer_portal','system','provider') NOT NULL,
  actorUserId INT NULL,
  actorPortalUserId INT NULL,
  action VARCHAR(255) NOT NULL,
  entityType VARCHAR(255) NOT NULL,
  entityId INT NULL,
  metadata JSON NULL,
  ipAddress VARCHAR(255) NULL,
  userAgent VARCHAR(255) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_chd_audit_org_ticket (org_id, ticketId),
  INDEX idx_chd_audit_org_action (org_id, action)
);

CREATE TABLE IF NOT EXISTS cre_customer_helpdesk_satisfaction (
  id INT AUTO_INCREMENT PRIMARY KEY,
  org_id INT NOT NULL,
  ticketId INT NOT NULL,
  portalUserId INT NOT NULL,
  customer_id INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT NULL,
  submittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_chd_csat_ticket_user (org_id, ticketId, portalUserId),
  INDEX idx_chd_csat_org_rating (org_id, rating)
);

ALTER TABLE cre_customer_helpdesk_tickets
  ADD COLUMN IF NOT EXISTS crescoSupportTicketId INT NULL,
  ADD COLUMN IF NOT EXISTS escalatedToCrescoAt DATETIME NULL;

ALTER TABLE cre_notifications
  MODIFY COLUMN user_id INT NULL;
