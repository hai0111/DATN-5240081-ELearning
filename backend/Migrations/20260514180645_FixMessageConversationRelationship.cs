using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocumentManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class FixMessageConversationRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Conversations_ConversationConvId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_ConversationConvId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "ConversationConvId",
                table: "Messages");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ConversationConvId",
                table: "Messages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ConversationConvId",
                table: "Messages",
                column: "ConversationConvId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Conversations_ConversationConvId",
                table: "Messages",
                column: "ConversationConvId",
                principalTable: "Conversations",
                principalColumn: "ConvId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
