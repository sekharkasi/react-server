import { MigrationInterface, QueryRunner } from "typeorm";

export class Users1745145998033 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // this part you will add your self
            await queryRunner.query(
              ` 
                  --Table Definition
                  CREATE TABLE "users"  (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "name" character varying NOT NULL,
                    "email" character varying NOT NULL,
                    "password" character varying NOT NULL,
                    "role"  character varying NOT NULL DEFAULT 'user',
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
                  )
        
                  
                  
                  
                  
                  `
            ),
              undefined;
          }
        
          public async down(queryRunner: QueryRunner): Promise<void> {
        // and this part
            await queryRunner.query(`DROP TABLE "users"`, undefined);
          }

}
